import {Injectable} from '@angular/core';
import {CertificateService} from "./certificate.service";
import {AuthService} from "../../auth/auth.service";
import {issueNewWithLocalKeys} from "../certificateUtil";
import {ItemType} from "../menuType";
import {CertificateBundle} from "../certificateBundle";
import {UserControllerService} from "../../backend-api/identity-registry";
import {firstValueFrom} from "rxjs";

interface EncryptedBlob {
    salt: Uint8Array,
    iv: Uint8Array,
    blob: Uint8Array
}

export interface SignaturePasswordRequest {
    mode: "create" | "unlock";
    message: string;
    requireConfirmation: boolean;
}

export type SignaturePasswordProvider = (request: SignaturePasswordRequest) => Promise<string>;

export enum SignatureProviderErrorCode {
    PasswordCancelled = "PASSWORD_CANCELLED",
    PasswordRequired = "PASSWORD_REQUIRED",
    DecryptionFailed = "DECRYPTION_FAILED",
    StorageFailed = "STORAGE_FAILED",
    IssuanceFailed = "ISSUANCE_FAILED"
}

export type CertificateInvalidReason = "revoked" | "expired" | "unregistered";

export class SignatureProviderError extends Error {
    constructor(
        public readonly code: SignatureProviderErrorCode,
        message: string
    ) {
        super(message);
        this.name = "SignatureProviderError";
    }
}

@Injectable({
    providedIn: 'root'
})
export class CertificateProviderService {

    private textEncoder = new TextEncoder();
    private cachedPassword: string | null = null;

    constructor(
        private certificateService: CertificateService,
        private authService: AuthService,
        private userService: UserControllerService
    ) {

    }

    public async getCertificate(passwordProvider: SignaturePasswordProvider): Promise<CertificateBundle | null> {
        const ownMrn = await this.authService.getUserMrnFromToken();
        const blob = await this.readEncryptedBlob(ownMrn);

        if (blob) {
            const password = await this.getPassword(passwordProvider, {
                mode: "unlock",
                message: "Enter the password used to unlock your encrypted certificate.",
                requireConfirmation: false
            });
            try {
                return await this.decryptBundle(blob, password);
            } catch {
                throw new SignatureProviderError(
                    SignatureProviderErrorCode.DecryptionFailed,
                    "Could not decrypt stored certificate. The password may be incorrect."
                );
            }
        }

        const password = await this.getPassword(passwordProvider, {
            mode: "create",
            message: "Create a password to encrypt your certificate in this browser.",
            requireConfirmation: true
        });

        return await this.createAndStoreCertBundle(ownMrn, password);
    }

    /**
     * Returns why the given certificate can no longer be used, or null if it is still valid.
     * The certificate is looked up in the user's certificate list in the Identity Registry, matched by
     * its DER content so serial number precision is not an issue, and the registry's revocation status
     * and expiry date are used. A certificate the registry does not know for this user is also unusable.
     */
    public async getInvalidReason(certBundle: CertificateBundle): Promise<CertificateInvalidReason | null> {
        if (!certBundle.certificate) {
            return null;
        }
        const ownDer = this.toDerBase64(certBundle.certificate);
        const user = await firstValueFrom(this.userService.getUser(
            await this.authService.getOrgMrnFromToken(),
            await this.authService.getUserMrnFromToken()
        ));
        const match = user.certificates?.find(c => c.certificate && this.toDerBase64(c.certificate) === ownDer);

        if (!match) {
            return "unregistered";
        }
        if (match.revoked) {
            return "revoked";
        }
        // The generated model types `end` as a Date, but over JSON it arrives as a string or epoch millis
        if (match.end != null) {
            const end = new Date(match.end as unknown as string | number);
            if (!isNaN(end.getTime()) && end.getTime() <= Date.now()) {
                return "expired";
            }
        }
        return null;
    }

    /**
     * Issues a new certificate for the current user and replaces the one stored in IndexedDB,
     * encrypted with the same password the user unlocked the old one with.
     */
    public async reissueCertificate(passwordProvider: SignaturePasswordProvider): Promise<CertificateBundle> {
        const ownMrn = await this.authService.getUserMrnFromToken();
        const password = await this.getPassword(passwordProvider, {
            mode: "create",
            message: "Your certificate is no longer valid. Create a password to encrypt your new certificate in this browser.",
            requireConfirmation: true
        });
        const bundle = await this.createAndStoreCertBundle(ownMrn, password);
        if (!bundle) {
            throw new SignatureProviderError(
                SignatureProviderErrorCode.IssuanceFailed,
                "Could not issue a new certificate"
            );
        }
        return bundle;
    }

    private toDerBase64(pem: string): string {
        return pem
            .replace(/-----(BEGIN|END) CERTIFICATE-----/g, '')
            .replace(/\s+/g, '');
    }

    private async createAndStoreCertBundle(ownMrn: string, password: string) {
        const certBundle = await issueNewWithLocalKeys(
            this.certificateService,
            ItemType.User,
            ownMrn,
            await this.authService.getOrgMrnFromToken(),
            false
        );

        if (certBundle) {
            try {
                await this.storeCertificate(certBundle, ownMrn, password);
            } catch {
                throw new SignatureProviderError(
                    SignatureProviderErrorCode.StorageFailed,
                    "Could not store certificate in IndexedDB"
                );
            }
            return certBundle;
        }
        return null;
    }

    private async getPassword(passwordProvider: SignaturePasswordProvider, request: SignaturePasswordRequest): Promise<string> {
        if (this.cachedPassword) {
            return this.cachedPassword;
        }

        const password = await passwordProvider(request);

        this.cachedPassword = password;
        return password;
    }

    private async readEncryptedBlob(ownMrn: string): Promise<EncryptedBlob | null> {
        const db = await this.getDB();
        const objectStore = db
            .transaction(["certificates"], "readonly")
            .objectStore("certificates");

        return await new Promise<EncryptedBlob | null>((resolve) => {
            const request = objectStore.get(ownMrn);

            request.onerror = (event) => {
                console.log(event);
                resolve(null);
            };

            request.onsuccess = () => {
                resolve((request.result as EncryptedBlob) ?? null);
            };
        });
    }

    private async getDB(): Promise<IDBDatabase> {
        return new Promise<IDBDatabase>((resolve, reject) => {
            const dbRequest = window.indexedDB.open("certificates_db", 1);

            dbRequest.onsuccess = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                resolve(db);
            }

            dbRequest.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                db.createObjectStore("certificates");
            }

            dbRequest.onerror = () => {
                reject(new Error("Could not connect to DB"));
            }
        });

    }

    private async storeCertificate(certBundle: CertificateBundle, ownMrn: string, password: string): Promise<boolean> {
        const blob = await this.encryptBundle(certBundle, password);

        const db = await this.getDB();
        const objectStore = db
            .transaction(["certificates"], "readwrite")
            .objectStore("certificates");

        return new Promise<boolean>((resolve, reject) => {
            const request = objectStore.put(blob, ownMrn);
            request.onsuccess = () => {
                console.log("Successfully stored certificate");
                resolve(true);
            }
            request.onerror = () => {
                reject("Could not store certificate in DB");
            }
        });
    }

    private async decryptBundle(encryptedBlob: EncryptedBlob, password: string): Promise<CertificateBundle> {
        const encryptionKey = await this.getEncryptionKey(password, encryptedBlob.salt);
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: encryptedBlob.iv
            },
            encryptionKey,
            encryptedBlob.blob
        );

        const utf8Decoder = new TextDecoder("utf-8");
        const bundleString = utf8Decoder.decode(decrypted);
        return JSON.parse(bundleString);
    }

    private async encryptBundle(certBundle: CertificateBundle, password: string): Promise<EncryptedBlob> {
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const bundleJson = JSON.stringify(certBundle);
        const bundleBuffer = this.textEncoder.encode(bundleJson);

        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptionKey = await this.getEncryptionKey(password, salt);
        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv
            },
            encryptionKey,
            bundleBuffer
        );

        return {
            salt,
            iv,
            blob: new Uint8Array(encrypted)
        };
    }

    private async getEncryptionKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            this.textEncoder.encode(password),
            "PBKDF2",
            false,
            ["deriveKey"]
        );

        return await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt,
                iterations: 250000,
                hash: "SHA-256"
            },
            keyMaterial,
            {
                name: "AES-GCM",
                length: 256
            },
            false,
            ["encrypt", "decrypt"]
        );
    }
}
