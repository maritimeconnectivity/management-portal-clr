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

@Injectable({
    providedIn: 'root'
})
export class SignatureProviderService {

    private textEncoder = new TextEncoder();

    constructor(
        private certificateService: CertificateService,
        private authService: AuthService
    ) {

    }

    public async getCertificate(): Promise<CertificateBundle | null> {
        const ownMrn = await this.authService.getUserMrnFromToken();
        const challenge = this.textEncoder.encode(ownMrn);

        let publicKeyCredential;
        try {
            publicKeyCredential = (await navigator.credentials.get({
                publicKey: {
                    challenge,
                    rpId: window.location.hostname,
                    timeout: 60000
                }
            })) as PublicKeyCredential;
        } catch (e) {
            console.error(e);
        }

        if (!publicKeyCredential) {
            try {
                await this.createPublicKeyCredential(challenge);
            } catch (e) {
                console.error("Failure:", e);
                return null;
            }

            try {
                publicKeyCredential = (await navigator.credentials.get({
                    publicKey: {
                        challenge,
                        rpId: window.location.hostname,
                        timeout: 60000
                    }
                })) as PublicKeyCredential;
            } catch (e) {
                console.error(e);
                return null;
            }

            const certBundle = await issueNewWithLocalKeys(
                this.certificateService,
                ItemType.User,
                ownMrn,
                await this.authService.getOrgMrnFromToken(),
                false
            );
            if (certBundle) {
                try {
                    await this.storeCertificate(certBundle, publicKeyCredential, ownMrn);
                } catch (e) {
                    console.error(e);
                }
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
                console.log(result);
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

                db.createObjectStore("certificates");
            }

            dbRequest.onerror = () => {
                reject(new Error("Could not connect to DB"));
            }
        });

    }

    private async createPublicKeyCredential(challenge: ArrayBuffer): Promise<void> {
        await navigator.credentials.create({
            publicKey: {
                challenge,
                rp: {id: window.location.hostname, name: "ACME Corporation"},
                user: {
                    id: new Uint8Array([79, 252, 83, 72, 214, 7, 89, 26]),
                    name: "jamiedoe",
                    displayName: "Jamie Doe",
                },
                pubKeyCredParams: [{type: "public-key", alg: -7}],
                authenticatorSelection: {
                    residentKey: "preferred"
                }
            }
        });
    }

    private async storeCertificate(certBundle: CertificateBundle, publicKeyCredential: PublicKeyCredential, ownMrn: string): Promise<boolean> {
        const blob = await this.encryptBundle(certBundle, publicKeyCredential);
        console.log(blob);

        const db = await this.getDB();
        const objectStore = db
            .transaction(["certificates"], "readwrite")
            .objectStore("certificates");

        return new Promise<boolean>((resolve, reject) => {
            const request = objectStore.add(blob, ownMrn);
            request.onsuccess = () => {
                console.log("Successfully stored certificate");
                resolve(true);
            }
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
        const bundleBuffer = this.textEncoder.encode(bundleJson);

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
            blob: new Uint8Array(encrypted)
        }
        return blob;
    }

    private async getEncryptionKey(publicKeyCredential: PublicKeyCredential, salt: Uint8Array): Promise<CryptoKey> {
        const passKeySignature = Array.from(new Uint8Array((publicKeyCredential.response as AuthenticatorAssertionResponse).signature), byte => byte.toString(16)).join("");
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            this.textEncoder.encode(passKeySignature),
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
