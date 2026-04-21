import {Injectable} from '@angular/core';
import {CertificateService} from "./certificate.service";
import {AuthService} from "../../auth/auth.service";
import {issueNewWithLocalKeys} from "../certificateUtil";
import {ItemType} from "../menuType";
import {CertificateBundle} from "../certificateBundle";

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
    StorageFailed = "STORAGE_FAILED"
}

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
        private authService: AuthService
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
