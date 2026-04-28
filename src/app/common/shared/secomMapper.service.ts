import { Injectable } from '@angular/core';
import {
    EnvelopeRetrieveResultObject,
    EnvelopeSearchFilterObject, RetrieveResultObject,
    SearchFilterObject,
    SearchParameters,
} from 'src/app/backend-api/secom';

export interface SecomSearchRequest {
    scope: boolean;
    searchParams: SearchParameters;
    geometry?: string;
    certificates: string[];
    thumbprint: string;
}

export interface SecomRetrieveRequest {
    xactId: string;
    certificates: string[];
    thumbprint: string;
}

@Injectable({
    providedIn: 'root',
})

export class SecomSearchMapperService {
    toSearchFilterObject(request: SecomSearchRequest): SearchFilterObject {
        const envelope: EnvelopeSearchFilterObject = {
            envelopeSignatureCertificate: request.certificates,
            envelopeRootCertificateThumbprint: request.thumbprint,
            envelopeSignatureTime: new Date(),
        };

        const d = new Date();
        const p = d.toISOString().slice(0, 19) + 'Z';

        envelope.envelopeSignatureTime = p as unknown as Date;


        if (request.searchParams && Object.keys(request.searchParams).length > 0) {
            envelope.query = request.searchParams;
            envelope.localOnly = request.scope;
        } else {
            envelope.query = {}
            envelope.localOnly = true;
        }

        if (request.geometry) {
            envelope.geometry = request.geometry;
        }

        const searchFilterObject: SearchFilterObject = {
            envelope: envelope,
            envelopeSignature: ""
        }
        return searchFilterObject;
    }

    toRetrieveResultsObj(request: SecomRetrieveRequest): RetrieveResultObject {
        const envelope: EnvelopeRetrieveResultObject = {
            envelopeSignatureCertificate: request.certificates,
            envelopeRootCertificateThumbprint: request.thumbprint,
            envelopeSignatureTime: new Date(),
            transactionId: request.xactId,
        };

        const d = new Date();
        const p = d.toISOString().slice(0, 19) + 'Z';

        envelope.envelopeSignatureTime = p as unknown as Date;


        const retrieveResultObject: RetrieveResultObject = {
            envelope: envelope,
            envelopeSignature: ""
        }
        return retrieveResultObject;
    }


}