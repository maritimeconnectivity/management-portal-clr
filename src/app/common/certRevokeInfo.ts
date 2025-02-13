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

import { CertificateRevocation } from './../backend-api/identity-registry/model/certificateRevocation';
export interface ReasonOption {
  value: CertificateRevocation.RevocationReasonEnum;
  title: string;
  description: string;
  reference: string;
}

// reference: https://www.itu.int/rec/dologin_pub.asp?lang=e&id=T-REC-X.509-201210-S!!PDF-E&type=items
export const getReasonOptionFromRevocationReason = (
  revocationReason:CertificateRevocation.RevocationReasonEnum): ReasonOption => {
    switch (revocationReason) {
      case CertificateRevocation.RevocationReasonEnum.Aacompromise: {
        return { value: revocationReason,
          title: 'AA compromised',
          description: 'This reason indicates that it is known or suspected that the certificate subject\'s private key has been compromised. It applies to authority attribute (AA) certificates only.',
          reference: 'https://docs.oracle.com/javase/8/docs/api/java/security/cert/CRLReason.html'};
      }
      case CertificateRevocation.RevocationReasonEnum.Affiliationchanged: {
        return { value: revocationReason,
          title: 'Affiliation changed',
          description: 'The user has terminated his or her relationship with the organization indicated in the Distinguished Name attribute of the certificate. This revocation code is typically used when an individual is terminated or has resigned from an organization. You do not have to revoke a certificate when a user changes departments, unless your security policy requires different certificate be issued by a departmental CA.',
          reference: 'https://docs.microsoft.com/en-us/previous-versions/tn-archive/cc700843(v=technet.10)?redirectedfrom=MSDN#revocation-reasons'};
      }
      case CertificateRevocation.RevocationReasonEnum.Cacompromise: {
        return { value: revocationReason,
          title: 'CA compromised',
          description: 'The token or disk location where the CA\'s private key is stored has been compromised and is in the possession of an unauthorized individual. When a CA\'s private key is revoked, this results in all certificates issued by the CA that are signed using the private key associated with the revoked certificate being considered revoked.',
          reference: 'https://docs.microsoft.com/en-us/previous-versions/tn-archive/cc700843(v=technet.10)?redirectedfrom=MSDN#revocation-reasons'};
      }
      case CertificateRevocation.RevocationReasonEnum.Certificatehold: {
        return { value: revocationReason,
          title: 'Certificate Hold',
          description: 'A temporary revocation that indicates that a CA will not vouch for a certificate at a specific point in time. Once a certificate is revoked with a CertificateHold reason code, the certificate can then be revoked with another Reason Code, or unrevoked and returned to use.',
          reference: 'https://docs.microsoft.com/en-us/previous-versions/tn-archive/cc700843(v=technet.10)?redirectedfrom=MSDN#revocation-reasons'};
      }
      case CertificateRevocation.RevocationReasonEnum.Cessationofoperation: {
        return { value: revocationReason,
          title: 'Cessation of Operation',
          description: 'If a CA is decommissioned, no longer to be used, the CA\'s certificate should be revoked with this reason code. Do not revoke the CA\'s certificate if the CA no longer issues new certificates, yet still publishes CRLs for the currently issued certificates.',
          reference: 'https://docs.microsoft.com/en-us/previous-versions/tn-archive/cc700843(v=technet.10)?redirectedfrom=MSDN#revocation-reasons'};
      }
      case CertificateRevocation.RevocationReasonEnum.Keycompromise: {
        return { value: revocationReason,
          title: 'Key compromised',
          description: 'The token or disk location where the private key associated with the certificate has been compromised and is in the possession of an unauthorized individual. This can include the case where a laptop is stolen, or a smart card is lost.',
          reference: 'https://docs.microsoft.com/en-us/previous-versions/tn-archive/cc700843(v=technet.10)?redirectedfrom=MSDN#revocation-reasons'};
      }
      case CertificateRevocation.RevocationReasonEnum.Privilegewithdrawn: {
        return { value: revocationReason,
          title: 'Privilege withdrawn',
          description: 'A certificate (public-key or attribute certificate) was revoked because a privilege contained within that certificate has been withdrawn',
          reference: 'https://docs.microsoft.com/en-us/previous-versions/tn-archive/cc700843(v=technet.10)?redirectedfrom=MSDN#revocation-reasons'};
      }
      case CertificateRevocation.RevocationReasonEnum.Removefromcrl: {
        return { value: revocationReason,
          title: 'Remove from CRL',
          description: 'If a certificate is revoked with the CertificateHold reason code, it is possible to "unrevoke" a certificate. The unrevoking process still lists the certificate in the CRL, but with the reason code set to RemoveFromCRL.',
          reference: 'https://docs.microsoft.com/en-us/previous-versions/tn-archive/cc700843(v=technet.10)?redirectedfrom=MSDN#revocation-reasons'};
      }
      case CertificateRevocation.RevocationReasonEnum.Superseded: {
        return { value: revocationReason,
          title: 'Superseded',
          description: 'A replacement certificate has been issued to a user, and the reason does not fall under the previous reasons. This revocation reason is typically used when a smart card fails, the password for a token is forgotten by a user, or the user has changed their legal name.',
          reference: 'https://docs.microsoft.com/en-us/previous-versions/tn-archive/cc700843(v=technet.10)?redirectedfrom=MSDN#revocation-reasons'};
      }
      case CertificateRevocation.RevocationReasonEnum.Unspecified: {
        return { value: revocationReason,
          title: 'Unspecified',
          description: 'It is possible to revoke a certificate without providing a specific reason code. While it is possible to revoke a certificate with the Unspecified reason code, this is not recommended, as it does not provide an audit trail as to why a certificate is revoked.',
          reference: 'https://docs.microsoft.com/en-us/previous-versions/tn-archive/cc700843(v=technet.10)?redirectedfrom=MSDN#revocation-reasons'};
      }
      default : {
        return { value: revocationReason,
          title: 'Unspecified',
          description: 'It is possible to revoke a certificate without providing a specific reason code. While it is possible to revoke a certificate with the Unspecified reason code, this is not recommended, as it does not provide an audit trail as to why a certificate is revoked.',
          reference: 'https://docs.microsoft.com/en-us/previous-versions/tn-archive/cc700843(v=technet.10)?redirectedfrom=MSDN#revocation-reasons'};
      }
    }
  }