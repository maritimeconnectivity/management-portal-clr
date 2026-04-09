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
            envelopeRootCertificateThumbprint: 'ec1938782d8c8c228bc214d19fbf1e65e2db689675d4e4f27e2f6fbedcefd8db',
            envelopeSignatureTime: new Date()
        };

        const d = new Date();
        let p = d.toISOString().slice(0, 19) + 'Z';
        envelope.envelopeSignatureTime = p as unknown as Date;



        envelope.envelopeSignatureCertificate.push('MIIEGjCCA6CgAwIBAgIUP8xnYt8h9PSbPvD4755OJynpLmswCgYIKoZIzj0EAwMwgdAxMDAuBgoJkiaJk/IsZAEBDCB1cm46bXJuOm1jcDpjYTptY2M6bWNwLWlkcmVnLW5ldzELMAkGA1UEBhMCREsxEDAOBgNVBAgMB0Rlbm1hcmsxEzARBgNVBAcMCkNvcGVuaGFnZW4xDDAKBgNVBAoMA01DUDEMMAoGA1UECwwDTUNQMR4wHAYDVQQDDBVNQ1AgSWRlbnRpdHkgUmVnaXN0cnkxLDAqBgkqhkiG9w0BCQEWHWluZm9AbWFyaXRpbWVjb25uZWN0aXZpdHkubmV0MB4XDTI2MDIxMzEzMDc1NVoXDTI2MDgxMzEzMDc1NVowgYoxCzAJBgNVBAYTAkRLMSEwHwYDVQQKDBh1cm46bXJuOm1jcDpvcmc6bWNjOmNvcmUxDzANBgNVBAsMBmRldmljZTERMA8GA1UEAwwITXNyLUdtc3AxNDAyBgoJkiaJk/IsZAEBDCR1cm46bXJuOm1jcDplbnRpdHk6bWNjOmNvcmU6bXNyLWdtc3AwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAT8AV8D47BPJcR1O5c84A1LvRExH0VnHLYzpghWAkvKSVRoz5903ivUgZNqUacAbTkxEGIPKeub75BXQBzHSrQmi6TWONe8fGV5Jk4RhKho0DD2Mh6DNKrmEiGLeTIiJbijggF9MIIBeTBJBgNVHREEQjBAoD4GFGmDmLzXwJ7w8MfLqp2AgKqu14oboCYMJHVybjptcm46bWNwOmVudGl0eTptY2M6Y29yZTptc3ItZ21zcDAfBgNVHSMEGDAWgBTXE6eyjUJ2syOddYYw/0oCgT7CyjAdBgNVHQ4EFgQUXmD2R3cwVkCxXtVEduYqfgpR9qYwbwYDVR0fBGgwZjBkoGKgYIZeaHR0cDovL2FwaS5tYXJpdGltZWNvbm5lY3Rpdml0eS5uZXQveDUwOS9hcGkvY2VydGlmaWNhdGVzL2NybC91cm46bXJuOm1jcDpjYTptY2M6bWNwLWlkcmVnLW5ldzB7BggrBgEFBQcBAQRvMG0wawYIKwYBBQUHMAGGX2h0dHA6Ly9hcGkubWFyaXRpbWVjb25uZWN0aXZpdHkubmV0L3g1MDkvYXBpL2NlcnRpZmljYXRlcy9vY3NwL3Vybjptcm46bWNwOmNhOm1jYzptY3AtaWRyZWctbmV3MAoGCCqGSM49BAMDA2gAMGUCMQD8uukUIT3r1aK2g9cL3vwERM7s0brWEe7zO0+g+I5o+SI1isxgJz8KoMAqJ2GPQMECMAlqnI267Z0OtfI+chExVZulg8u9djn6FgOSjr1HwJKnia68K5pCb8Ij0jI9ESzBOg==');

        if (request.searchParams && Object.keys(request.searchParams).length > 0) {
            envelope.query = request.searchParams;
            envelope.localOnly = request.scope;
        }

        if (request.geometry) {
            envelope.geometry = request.geometry;
        }

        const searchFilterObject: SearchFilterObject = {
            envelope: envelope,
            envelopeSignature: "3065023100c930ca1d32f647a7a564f854c96357860da5df96ef05b5f5e102b7739ab7d3f8edce0357e07f09b9a531a7cc57d3c5bb02307d58984e10906bab054defe39ca2e77f21fbf6d988195a4d78fe879ace0d22c242e8bc8812cb95a337e34de63880d676"
        }
        return searchFilterObject;
    }


}