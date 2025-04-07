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

import {ItemType} from "./menuType";
import {CertificateService} from "./shared/certificate.service";
import {CertificateBundle} from "./certificateBundle";

export const issueNewWithLocalKeys = async (
    certificateService: CertificateService,
    itemType: ItemType,
    mrn: string,
    orgMrn: string,
    generatePkcs12: boolean,
): Promise<CertificateBundle | undefined> => {
    try {
        const csrResult = await createCsr();
        const certificateText: string = await new Promise((resolve, reject) => {
            certificateService.issueNewCertificate(csrResult.csr, itemType, mrn, orgMrn)
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
        if (generatePkcs12) {
            const keystoreResult = await createPKCS12Keystore(certificateText, csrResult.rawPrivateKey);

            return {
                certificate: certificateText,
                publicKey: csrResult.publicKeyPem,
                privateKey: csrResult.privateKeyPem,
                pkcs12Keystore: keystoreResult.keystore,
                keystorePassword: keystoreResult.password,
            }
        } else {
            return {
                certificate: certificateText,
                publicKey: csrResult.publicKeyPem,
                privateKey: csrResult.privateKeyPem,
            }
        }
    } catch (err) {
        console.error('Error while issuing new certificate:', err);
        return undefined;
    }
}
