import { Injectable } from '@angular/core';
import {
    EnvelopeRetrieveResultObject,
    EnvelopeSearchFilterObject, RetrieveResultObject,
    SearchFilterObject,
} from 'src/app/backend-api/secom';
import {CertificateBundle} from "../certificateBundle";
import format from 'ecdsa-sig-formatter'


export interface SigningMaterial {
    bundle: CertificateBundle;
    rootCertificateThumbprint: string;
}

@Injectable({
    providedIn: 'root',
})
export class SecomSignerProvider {
    private signingMaterial?: SigningMaterial;

    setSigningMaterial(signingMaterial: SigningMaterial): void {
        this.signingMaterial = signingMaterial;
    }

    getSigningMaterial(): SigningMaterial {
        if (!this.signingMaterial) {
            throw new Error('Signing material has not been set');
        }

        return this.signingMaterial;
    }

    clearSigningMaterial(): void {
        this.signingMaterial = undefined;
    }
}

@Injectable({
    providedIn: 'root',
})

// SigningMaterialService owns/retrieves the signer state and the service below only does the signing
export class SecomSigningService {
    constructor(
        private ssp: SecomSignerProvider,
    ) {}

    private get signingMaterial(): SigningMaterial {
        return this.ssp.getSigningMaterial();
    }


    async signRetrieveResultObject(rro: RetrieveResultObject): Promise<RetrieveResultObject> {
        const sm: SigningMaterial = this.ssp.getSigningMaterial();
        const envelope = rro.envelope as EnvelopeRetrieveResultObject;


        const bytes = this.toBytesRetrieveResult(envelope);

        const algorithm: EcdsaParams = {
            name: 'ECDSA',
            hash: 'SHA-384',
        };

        if (!sm.bundle.privateKey) {
            throw new Error('No private key found');
        }

        const pk = await this.pemToCryptoKey(sm.bundle.privateKey);
        const sigBuf = await crypto.subtle.sign(algorithm, pk, bytes);

        const raw = new Uint8Array(sigBuf);
        const jose = this.toBase64Url(raw);

        const derSignature = format.joseToDer(jose, 'ES384');
        const derBytes = new Uint8Array(derSignature);

        const signatureHex = Array.from(
            derBytes,
            byte => byte.toString(16).padStart(2, '0'),
        ).join('');

        return {
            envelope,
            envelopeSignature: signatureHex,
        };
    }

    private toBytesRetrieveResult(erro: EnvelopeRetrieveResultObject): Uint8Array {
        const cert = this.signingMaterial.bundle.certificate;
        if (!cert) {
            throw new Error('No certificate found');
        }
        const thumbprint = this.signingMaterial.rootCertificateThumbprint;
        if (!thumbprint) {
            throw new Error('No root certificate thumbprint found');
        }

        const transactionIdPayload = erro.transactionId

        const certs = this.toMinifiedPemList(cert);
        const certPayload = `[${certs.join(', ')}]`;
        const timestampPayload = this.toUnixTimestampSeconds(erro.envelopeSignatureTime);

        const payload =
            transactionIdPayload +
            '.' +
            certPayload +
            '.' +
            thumbprint +
            '.' +
            timestampPayload;

        return new TextEncoder().encode(payload);
    }


    async signSearchFilterObject(sfo: SearchFilterObject): Promise<SearchFilterObject> {
        const sm: SigningMaterial = this.ssp.getSigningMaterial();
        const envelope = sfo.envelope as EnvelopeSearchFilterObject;


        const bytes = this.toBytes(envelope);

        const algorithm: EcdsaParams = {
            name: 'ECDSA',
            hash: 'SHA-384',
        };

        if (!sm.bundle.privateKey) {
            throw new Error('No private key found');
        }

        const pk = await this.pemToCryptoKey(sm.bundle.privateKey);
        const sigBuf = await crypto.subtle.sign(algorithm, pk, bytes);

        const raw = new Uint8Array(sigBuf);
        const jose = this.toBase64Url(raw);

        const derSignature = format.joseToDer(jose, 'ES384');
        const derBytes = new Uint8Array(derSignature);

        const signatureHex = Array.from(
            derBytes,
            byte => byte.toString(16).padStart(2, '0'),
        ).join('');


        return {
            envelope,
            envelopeSignature: signatureHex,
        };
    }

    private async pemToCryptoKey(pem: string): Promise<CryptoKey> {
        const pemContents = pem
            .replace('-----BEGIN PRIVATE KEY-----', '')
            .replace('-----END PRIVATE KEY-----', '')
            .replace(/\s+/g, '');

        const binaryDerString = atob(pemContents);
        const binaryDer = new Uint8Array(binaryDerString.length);

        for (let i = 0; i < binaryDerString.length; i++) {
            binaryDer[i] = binaryDerString.charCodeAt(i);
        }

        return crypto.subtle.importKey(
            'pkcs8',
            binaryDer.buffer,
            {
                name: 'ECDSA',
                namedCurve: 'P-384',
            },
            false,
            ['sign'],
        );
    }


    private toMinifiedPemList(pemBundle: string): string[] {
        const matches = pemBundle.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g);

        if (!matches) {
            return [];
        }

        return matches.map(cert =>
            cert
                .replace('-----BEGIN CERTIFICATE-----', '')
                .replace('-----END CERTIFICATE-----', '')
                .replace(/[\r\n\s]+/g, '')
        );
    }



    private toBytes(esfo: EnvelopeSearchFilterObject): Uint8Array {
        const cert = this.signingMaterial.bundle.certificate;
        if (!cert) {
            throw new Error('No certificate found');
        }

        const thumbprint = this.signingMaterial.rootCertificateThumbprint;
        if (!thumbprint) {
            throw new Error('No root certificate thumbprint found');
        }

        // Only if there is a query
        const queryPayload = this.serializeQueryPayload(esfo.query ?? {});
        const geometryPayload = esfo.geometry ?? '';
        const localOnlyPayload = String(esfo.localOnly ?? true).toLowerCase();

        const certs = this.toMinifiedPemList(cert);
        const certPayload = `[${certs.join(', ')}]`;
        const timestampPayload = this.toUnixTimestampSeconds(esfo.envelopeSignatureTime);

        const payload =
            queryPayload +
            '.' +
            geometryPayload +
            '.' +
            localOnlyPayload +
            '.' +
            certPayload +
            '.' +
            thumbprint +
            '.' +
            timestampPayload;

        return new TextEncoder().encode(payload);
    }

    private serializeQueryPayload(query: EnvelopeSearchFilterObject['query']): string {
        const q = query ?? {};

        let payload = '';

        payload += q.name ?? '';
        payload += '.';

        payload += q.status ?? '';
        payload += '.';

        payload += q.version ? q.version : '';
        payload += '.';

        if (q.keywords && q.keywords.length > 0) {
            payload += '['
            for (const keyword of q.keywords) {
                payload += keyword
            }
            payload += ']'
        }
        payload += '.';


        payload += q.description ? q.description : '';
        payload += '.';

        if (q.dataProductType && q.dataProductType.length > 0) {
            payload += q.dataProductType[0];
        }
        payload += '.';

        payload += q.specificationId ? q.specificationId : '';
        payload += '.';

        payload += q.designId ? q.designId : '';
        payload += '.';

        payload += q.instanceId ? q.instanceId : '';
        payload += '.';

        payload += q.mmsi != null ? String(q.mmsi) : '';
        payload += '.';

        payload += q.imo != null ? String(q.imo) : '';
        payload += '.';

        payload += q.serviceType ? String(q.serviceType) : '';
        payload += '.';

        if (q.unlocode && q.unlocode.length > 0) {
            payload += q.unlocode[0];
        }
        payload += '.';

        payload += q.endpointUri ? q.endpointUri : '';

        return payload;
    }

    private toUnixTimestampSeconds(value: unknown): string {
        const date = value instanceof Date ? value : new Date(String(value));
        return String(Math.floor(date.getTime() / 1000));
    }

    private toBase64Url(bytes: Uint8Array): string {
        let binary = '';
        for (const b of bytes) {
            binary += String.fromCharCode(b);
        }

        return btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

}

