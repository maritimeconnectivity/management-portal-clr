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

    constructor(
        private certificateService: CertificateService,
        private authService: AuthService
    ) {

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

        const db = await this.getDB();
        const objectStore = db
            .transaction(["certificates"], "readonly")
            .objectStore("certificates");

        const blob = await new Promise<EncryptedBlob | null>((resolve) => {
            const request = objectStore.get(ownMrn);

            request.onerror = () => resolve(null);
            request.onsuccess = () => {
                const result = request.result as EncryptedBlob;
                resolve(result);
            }
        });

        if (blob) {
            return await this.decryptBundle(blob, publicKeyCredential);
        }
        return null;
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

                const objectStore = db.createObjectStore("certificates", {keyPath: "id", autoIncrement: true});
                objectStore.createIndex("mrn", "mrn", {unique: true});

                resolve(db);
            }

            dbRequest.onerror = () => {
                reject(new Error("Could not connect to DB"));
            }
        });

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

    private async storeCertificate(certBundle: CertificateBundle, publicKeyCredential: PublicKeyCredential, ownMrn: string): Promise<void> {
        const blob = await this.encryptBundle(certBundle, publicKeyCredential);

        const db = await this.getDB();
        const objectStore = db
            .transaction(["certificates"], "readwrite")
            .objectStore("certificates");

        return new Promise((resolve, reject) => {
            const request = objectStore.add(blob, ownMrn);
            request.onsuccess = () => resolve();
            request.onerror = () => {
                reject("Could not store certificate in DB");
            }
        });
    }

    private async decryptBundle(encryptedBlob: EncryptedBlob, publicKeyCredential: PublicKeyCredential): Promise<CertificateBundle> {
        const salt = encryptedBlob.salt;
        const iv = encryptedBlob.iv;
        const blob = encryptedBlob.blob;

        const encryptionKey = await this.getEncryptionKey(publicKeyCredential, salt);
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv
            },
            encryptionKey,
            blob
        );

        const utf8Decoder = new TextDecoder("utf-8");
        const bundleString = utf8Decoder.decode(decrypted);
        return JSON.parse(bundleString);
    }

    private async encryptBundle(certBundle: CertificateBundle, publicKeyCredential: PublicKeyCredential) {
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
        return blob;
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
