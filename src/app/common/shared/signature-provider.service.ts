import {Injectable} from '@angular/core';
import {CertificateService} from "./certificate.service";
import {AuthService} from "../../auth/auth.service";
import {issueNewWithLocalKeys} from "../certificateUtil";
import {ItemType} from "../menuType";
import {CertificateBundle} from "../certificateBundle";

interface EncryptedBlob {
    salt: Uint8Array,
    iv: Uint8Array,
    blob: ArrayBuffer
}

@Injectable({
    providedIn: 'root'
})
export class SignatureProviderService {

    private db: IDBDatabase | undefined;

    constructor(
        private certificateService: CertificateService,
        private authService: AuthService
    ) {
        const dbRequest = window.indexedDB.open("certificates_db", 1);

        dbRequest.onsuccess = (event) => {
            this.db = (event.target as IDBOpenDBRequest).result;
        }

        dbRequest.onupgradeneeded = (event) => {
            this.db = (event.target as IDBOpenDBRequest).result;

            const objectStore = this.db.createObjectStore("certificates", {keyPath: "id", autoIncrement: true});
            objectStore.createIndex("mrn", "mrn", {unique: true});
        }
    }

    public async getCertificate(): Promise<CertificateBundle | null> {
        const ownMrn = await this.authService.getUserMrnFromToken();
        const challenge = Buffer.from(ownMrn, "utf-8");

        let publicKeyCredential = await navigator.credentials.get({
            publicKey: {
                challenge,
                timeout: 60000
            }
        }) as PublicKeyCredential | null;

        if (!publicKeyCredential) {
            const certBundle = await issueNewWithLocalKeys(
                this.certificateService,
                ItemType.User,
                ownMrn,
                await this.authService.getOrgMrnFromToken(),
                false
            );

            if (certBundle) {
                publicKeyCredential = (await this.createPublicKeyCredential(challenge))!;

                await this.storeCertificate(certBundle, publicKeyCredential, ownMrn);
                return certBundle;
            }
            return null;
        }
    }

    private async createPublicKeyCredential(challenge: Buffer): Promise<PublicKeyCredential | null> {
        return await navigator.credentials.create({
            publicKey: {
                challenge,
                rp: {
                    name: window.location.hostname,
                    id: window.location.hostname
                },
                user: {
                    id: Buffer.from(self.crypto.randomUUID()),
                    name: "MCP Management Portal",
                    displayName: "MCP Management Portal"
                },
                pubKeyCredParams: [
                    {
                        type: "public-key",
                        alg: -257 // RS256
                    }
                ],
                timeout: 60000,
                attestation: "none",
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required",
                    residentKey: "required",
                    requireResidentKey: true
                }
            }
        }) as PublicKeyCredential;
    }

    private async storeCertificate(certBundle: CertificateBundle, publicKeyCredential: PublicKeyCredential, ownMrn: string) {
        const salt = window.crypto.getRandomValues(new Uint8Array(16));

        const bundleJson = JSON.stringify(certBundle);
        const bundleBuffer = Buffer.from(bundleJson, "utf-8");

        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptionKey = await this.getEncryptionKey(publicKeyCredential, salt);
        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv
            },
            encryptionKey,
            bundleBuffer
        );

        const blob: EncryptedBlob = {
            salt,
            iv,
            blob: encrypted
        }

        if (!this.db) {
            return Promise.reject(new Error("IndexedDB is not available"));
        }

        const objectStore = this.db
            .transaction(["certificates"], "readwrite")
            .objectStore("certificates");
        const request = objectStore.add(blob, ownMrn);

        return new Promise((resolve, reject) => {
           request.onsuccess = () => resolve;
           request.onerror = () => {
               reject("Could not store certificate in DB");
           }
        });
    }

    private async getEncryptionKey(publicKeyCredential: PublicKeyCredential, salt: Uint8Array): Promise<CryptoKey> {
        const passKeySignature = Buffer.from((publicKeyCredential.response as AuthenticatorAssertionResponse).signature).toString("hex");
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            Buffer.from(passKeySignature),
            "PBKDF2",
            false,
            ["deriveBits", "deriveKey"]
        );

        return await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            {
                name: "AES-GCM",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        );
    }
}
