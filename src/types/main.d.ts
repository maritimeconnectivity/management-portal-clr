/**
 * Interface containing the result of generating a CSR
 *
 * @property privateKeyPem PEM encoded private key
 * @property rawPrivateKey the DER encoded private key
 * @property publicKeyPem PEM encoded public key
 * @property csr PEM encoded CSR
 */
interface CsrResult {
    privateKeyPem: string;
    rawPrivateKey: Uint8Array;
    publicKeyPem: string;
    csr: string;
}

/**
 * Interface containing the result of generating a PKCS12 keystore
 *
 * @property keystore DER encoded PKCS#12 keystore
 * @property password the generated password of the keystore
 */
interface KeystoreResult {
    keystore: Uint8Array;
    password: string;
}

/**
 * Create a CSR
 */
declare function createCsr(): Promise<CsrResult>;

/**
 * Creates a PKCS#12 keystore
 *
 * @param pemCertificateChain a string containing either a single or a chain of PEM encoded certificates
 * @param rawPrivateKey DER encoded private key of the first certificate in the certificate chain
 */
declare function createPKCS12Keystore(pemCertificateChain: string, rawPrivateKey: Uint8Array): Promise<KeystoreResult>;
