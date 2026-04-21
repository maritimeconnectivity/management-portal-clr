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
            envelopeSignatureTime: new Date(),
            envelopeSignatureReference: 'sha384'
        };

        const d = new Date();
        let p = d.toISOString().slice(0, 19) + 'Z';

        console.log("SIG TIME IS ", p )

        envelope.envelopeSignatureTime = p as unknown as Date;


        envelope.envelopeSignatureCertificate.push('MIIEGjCCA6CgAwIBAgIUP8xnYt8h9PSbPvD4755OJynpLmswCgYIKoZIzj0EAwMwgdAxMDAuBgoJkiaJk/IsZAEBDCB1cm46bXJuOm1jcDpjYTptY2M6bWNwLWlkcmVnLW5ldzELMAkGA1UEBhMCREsxEDAOBgNVBAgMB0Rlbm1hcmsxEzARBgNVBAcMCkNvcGVuaGFnZW4xDDAKBgNVBAoMA01DUDEMMAoGA1UECwwDTUNQMR4wHAYDVQQDDBVNQ1AgSWRlbnRpdHkgUmVnaXN0cnkxLDAqBgkqhkiG9w0BCQEWHWluZm9AbWFyaXRpbWVjb25uZWN0aXZpdHkubmV0MB4XDTI2MDIxMzEzMDc1NVoXDTI2MDgxMzEzMDc1NVowgYoxCzAJBgNVBAYTAkRLMSEwHwYDVQQKDBh1cm46bXJuOm1jcDpvcmc6bWNjOmNvcmUxDzANBgNVBAsMBmRldmljZTERMA8GA1UEAwwITXNyLUdtc3AxNDAyBgoJkiaJk/IsZAEBDCR1cm46bXJuOm1jcDplbnRpdHk6bWNjOmNvcmU6bXNyLWdtc3AwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAT8AV8D47BPJcR1O5c84A1LvRExH0VnHLYzpghWAkvKSVRoz5903ivUgZNqUacAbTkxEGIPKeub75BXQBzHSrQmi6TWONe8fGV5Jk4RhKho0DD2Mh6DNKrmEiGLeTIiJbijggF9MIIBeTBJBgNVHREEQjBAoD4GFGmDmLzXwJ7w8MfLqp2AgKqu14oboCYMJHVybjptcm46bWNwOmVudGl0eTptY2M6Y29yZTptc3ItZ21zcDAfBgNVHSMEGDAWgBTXE6eyjUJ2syOddYYw/0oCgT7CyjAdBgNVHQ4EFgQUXmD2R3cwVkCxXtVEduYqfgpR9qYwbwYDVR0fBGgwZjBkoGKgYIZeaHR0cDovL2FwaS5tYXJpdGltZWNvbm5lY3Rpdml0eS5uZXQveDUwOS9hcGkvY2VydGlmaWNhdGVzL2NybC91cm46bXJuOm1jcDpjYTptY2M6bWNwLWlkcmVnLW5ldzB7BggrBgEFBQcBAQRvMG0wawYIKwYBBQUHMAGGX2h0dHA6Ly9hcGkubWFyaXRpbWVjb25uZWN0aXZpdHkubmV0L3g1MDkvYXBpL2NlcnRpZmljYXRlcy9vY3NwL3Vybjptcm46bWNwOmNhOm1jYzptY3AtaWRyZWctbmV3MAoGCCqGSM49BAMDA2gAMGUCMQD8uukUIT3r1aK2g9cL3vwERM7s0brWEe7zO0+g+I5o+SI1isxgJz8KoMAqJ2GPQMECMAlqnI267Z0OtfI+chExVZulg8u9djn6FgOSjr1HwJKnia68K5pCb8Ij0jI9ESzBOg==');

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


}