/*
 * Copyright (c) 2025 Maritime Connectivity Platform Consortium
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {fromBER, OctetString, PrintableString} from "asn1js";
import {
    Attribute,
    AttributeTypeAndValue,
    AuthenticatedSafe,
    CertBag,
    Certificate,
    CertificationRequest,
    getRandomValues,
    PFX,
    PKCS8ShroudedKeyBag,
    PrivateKeyInfo,
    SafeBag,
    SafeContents
} from "pkijs";
import {ItemType} from "./menuType";
import {Convert} from "pvtsutils";
import {CertificateService} from "./shared/certificate.service";
import {CertificateBundle} from "./certificateBundle";
import {stringToArrayBuffer} from 'pvutils';


export const issueNewWithLocalKeys = async (
    certificateService: CertificateService,
    itemType: ItemType,
    mrn: string,
    orgMrn: string,
    generatePkcs12: boolean,
    instanceVersion?: string
): Promise<CertificateBundle | undefined> => {
    try {
        const ecKeyGenParams = {name: 'ECDSA', namedCurve: 'P-384', typedCurve: ''};
        const keyPair = await crypto.subtle.generateKey(ecKeyGenParams, true, ['sign', 'verify']);

        const csr = new CertificationRequest();
        csr.subject.typesAndValues.push(new AttributeTypeAndValue({
            type: '2.5.4.3', // Common name
            value: new PrintableString({value: 'Test'}),
        }));

        await csr.subjectPublicKeyInfo.importKey(keyPair.publicKey);
        await csr.sign(keyPair.privateKey, 'SHA-384');

        const csrBytes = csr.toSchema().toBER(false);
        const pemCsr = toPem(csrBytes, 'CERTIFICATE REQUEST');

        const certificateText: string = await new Promise((resolve, reject) => {
            certificateService.issueNewCertificate(pemCsr, itemType, mrn, orgMrn)
                .subscribe(
                    (cert) => {
                        // Handle successful response, e.g., process the certificate if needed

                    },
                    err => {
                        // Successful response but failure in PEM fitting to JSON format
                        if (err.status === 201) {
                            resolve(err.error.text); // Return the certificate text on 201 status
                        } else {
                            console.error('Error when trying to issue new certificate:', err.error.message);
                            reject(err); // Reject the promise in case of error
                        }
                    }
                );
        });
        const rawPrivateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
        const rawPublicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);

        const privateKey = new PrivateKeyInfo({schema: fromBER(rawPrivateKey).result});

        if (generatePkcs12) {
            const rawCerts = convertCertChain(certificateText);
            const certs = rawCerts.map(cert => new Certificate({schema: fromBER(cert).result}));
            const password = generatePassword();

            const pkcs12Keystore = await generatePKCS12(privateKey, certs, password);

            return {
                certificate: certificateText,
                publicKey: toPem(rawPublicKey, 'PUBLIC KEY'),
                privateKey: toPem(rawPrivateKey, 'PRIVATE KEY'),
                pkcs12Keystore,
                keystorePassword: password,
            };
        } else {
            return {
                certificate: certificateText,
                publicKey: toPem(rawPublicKey, 'PUBLIC KEY'),
                privateKey: toPem(rawPrivateKey, 'PRIVATE KEY'),
            };
        }
    } catch (err) {
        console.error('Error while issuing new certificate:', err);
        return undefined;
    }
}
const toPem = (arrayBuffer: ArrayBuffer, type: string): string => {
    let b64 = Convert.ToBase64(arrayBuffer);
    let finalString = '';
    while (b64.length > 0) {
        finalString += b64.substring(0, 64) + '\n';
        b64 = b64.substring(64);
    }
    return `-----BEGIN ${type}-----\n${finalString}-----END ${type}-----\n`;
}

const convertCertChain = (pemCertChain: string): ArrayBuffer[] => {
    let certs = pemCertChain.split(/-----END CERTIFICATE-----/);
    certs = certs.slice(0, certs.length - 1);
    const tmp = certs.map(c => c.split(/-----BEGIN CERTIFICATE-----/)[1].replace(/\n/mg, ''));
    return tmp.map(c => Convert.FromBase64(c));
}

const generatePassword = (): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_^$#&!%';
    const values = new Uint32Array(26);
    crypto.getRandomValues(values);
    let result = '';
    for (const element of values) {
        result += charset[element % charset.length];
    }
    return result;
}

const generatePKCS12 = async (privateKey: PrivateKeyInfo, certs: Certificate[], password: string)
    : Promise<ArrayBuffer> => {
    const certLocalIDBuffer = new ArrayBuffer(20);
    const certLocalIDView = new Uint8Array(certLocalIDBuffer);
    getRandomValues(certLocalIDView);

    const caCertLocalIDBuffer = new ArrayBuffer(20);
    const caCertLocalIDView = new Uint8Array(caCertLocalIDBuffer);
    getRandomValues(caCertLocalIDView);

    const pfx = new PFX({
        parsedValue: {
            integrityMode: 0,
            authenticatedSafe: new AuthenticatedSafe({
                parsedValue: {
                    safeContents: [
                        {
                            privacyMode: 1,
                            value: new SafeContents({
                                safeBags: [
                                    new SafeBag({
                                        bagId: '1.2.840.113549.1.12.10.1.2',
                                        bagValue: new PKCS8ShroudedKeyBag({
                                            parsedValue: privateKey
                                        }),
                                        bagAttributes: [
                                            new Attribute({
                                                type: '1.2.840.113549.1.9.21', // localKeyID
                                                values: [
                                                    new OctetString({valueHex: certLocalIDBuffer})
                                                ]
                                            }),
                                        ]
                                    }),
                                    new SafeBag({
                                        bagId: '1.2.840.113549.1.12.10.1.3',
                                        bagValue: new CertBag({
                                            parsedValue: certs[0]
                                        }),
                                        bagAttributes: [
                                            new Attribute({
                                                type: '1.2.840.113549.1.9.21', // localKeyID
                                                values: [
                                                    new OctetString({valueHex: certLocalIDBuffer})
                                                ]
                                            }),
                                        ]
                                    }),
                                    new SafeBag({
                                        bagId: '1.2.840.113549.1.12.10.1.3',
                                        bagValue: new CertBag({
                                            parsedValue: certs[1]
                                        }),
                                        bagAttributes: [
                                            new Attribute({
                                                type: '1.2.840.113549.1.9.21', // localKeyID
                                                values: [
                                                    new OctetString({valueHex: caCertLocalIDBuffer})
                                                ]
                                            }),
                                        ]
                                    })
                                ]
                            })
                        },
                    ]
                }
            })
        }
    });
    const passwordConverted = stringToArrayBuffer(password);

    await pfx.parsedValue!.authenticatedSafe!.parsedValue.safeContents[0].value
        .safeBags[0].bagValue.makeInternalValues({
        password: passwordConverted,
        contentEncryptionAlgorithm: {
            name: 'AES-CBC', // OpenSSL can handle AES-CBC only
            length: 256
        },
        hmacHashAlgorithm: 'SHA-256',
        iterationCount: 2048
    });

    await pfx.parsedValue!.authenticatedSafe!.makeInternalValues({
        safeContents: [
            {
                password: passwordConverted,
                contentEncryptionAlgorithm: {
                    name: 'AES-CBC', // OpenSSL can handle AES-CBC only
                    length: 256
                },
                hmacHashAlgorithm: 'SHA-256',
                iterationCount: 2048
            }
        ]
    });

    await pfx.makeInternalValues({
        password: passwordConverted,
        iterations: 2048,
        pbkdf2HashAlgorithm: 'SHA-256',
        hmacHashAlgorithm: 'SHA-256'
    })

    return pfx.toSchema().toBER(false);
}
