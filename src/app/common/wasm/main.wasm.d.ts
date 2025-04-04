export interface CsrResult {
    privateKeyPem: string;
    rawPrivateKey: Uint8Array;
    publicKeyPem: string;
    csr: string;
}

export interface KeystoreResult {
    keystore: Uint8Array;
    password: string;
}

declare function createCsr(): Promise<CsrResult>;
declare function createPKCS12Keystore(pemCertificateChain: string, rawPrivateKey: Uint8Array): Promise<KeystoreResult>;
