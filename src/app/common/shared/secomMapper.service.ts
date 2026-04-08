import { Injectable } from '@angular/core';
import {
    EnvelopeSearchFilterObject,
    SearchFilterObject,
    SearchParameters,
} from 'src/app/backend-api/secom';

export interface SecomSearchRequest {
    scope: boolean;
    searchParams: SearchParameters;
    geometry?: string;
}

@Injectable({
    providedIn: 'root',
})

export class SecomSearchMapperService {
    toSearchFilterObject(request: SecomSearchRequest): SearchFilterObject {
        const envelope: EnvelopeSearchFilterObject = {
            envelopeSignatureCertificate: [],
            envelopeRootCertificateThumbprint: '',
            envelopeSignatureTime: new Date(),
        };

        if (request.searchParams && Object.keys(request.searchParams).length > 0) {
            envelope.query = request.searchParams;
            envelope.localOnly = request.scope;
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
}