import { Injectable } from '@angular/core';
import {
    EnvelopeSearchFilterObject,
    SearchFilterObject,
    SearchParameters,
} from 'src/app/backend-api/secom';
import {CertificateBundle} from "../certificateBundle";


export interface SigningMaterial {
    bundle: CertificateBundle;
    rootCertificateThumbprint: string;
}

@Injectable({
    providedIn: 'root',
})

export class SecomSignerProvider {
     getSigningMaterial(): SigningMaterial {
        // fetch Olivers code
        throw new Error('Not implemented');
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

    signSearchFilterObject(
        sfo: SearchFilterObject,
    ): SearchFilterObject {
        const sm: SigningMaterial = this.ssp.getSigningMaterial();

        const envelope = sfo.envelope as EnvelopeSearchFilterObject;


        //Returns the SearchFilterObject with the signature
        return {
            envelope,
            envelopeSignature: '',
        };
    }


    private toMinifiedPem(pem : string) : string {
        return pem.replace(/[\r\n]+/g, '');
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

        const query = esfo.query;
        const serializedQuery = query
            ? [
                query.name ?? '',
                query.status != null ? String(query.status) : '',
                query.version ?? '',
                query.keywords?.join(',') ?? '',
                query.description ?? '',
                query.dataProductType?.join(',') ?? '',
                query.specificationId ?? '',
                query.designId ?? '',
                query.instanceId ?? '',
                query.mmsi != null ? String(query.mmsi) : '',
                query.imo != null ? String(query.imo) : '',
                query.serviceType != null ? String(query.serviceType) : '',
                query.unlocode?.join(',') ?? '',
                query.endpointUri ?? '',
            ].join('.')
            : '';

        const csv = [
            this.toMinifiedPem(cert),
            thumbprint,
            esfo.envelopeSignatureTime.toString(),
            esfo.localOnly == null ? true : esfo.localOnly,
            serializedQuery,
        ].join('.');

        return new TextEncoder().encode(csv);
    }

}

