/*
 * Copyright (c) 2026 Maritime Connectivity Platform Consortium
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

import {Injectable} from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

// Matches a bare, unquoted "serialNumber" numeric value in raw JSON text, e.g. "serialNumber":123456789012345
const SERIAL_NUMBER_PATTERN = /"serialNumber"\s*:\s*(-?\d+)(?![.\d])/g;

/**
 * Certificate serial numbers can exceed Number.MAX_SAFE_INTEGER, so parsing them with the
 * default JSON.parse (used internally by HttpClient for 'json' responses) silently loses
 * precision. This interceptor requests the raw response as text instead, quotes any
 * "serialNumber" values before parsing so they survive JSON.parse intact.
 *
 * Some endpoints (e.g. certificate issuance) reply with a non-JSON body such as raw PEM text
 * despite 'json' being the requested responseType. Angular's own HttpXhrBackend tolerates
 * that: a body that fails JSON.parse is delivered on the error channel as an HttpErrorResponse
 * shaped as `{ error, text: <original body> }`, and callers in this app rely on that shape to
 * recover the raw text (see certificateUtil.ts). We replicate that fallback here so bypassing
 * Angular's built-in JSON parsing doesn't change that contract.
 */
@Injectable()
export class SerialNumberInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.responseType !== 'json') {
            return next.handle(req);
        }

        const textReq = req.clone({responseType: 'text'});
        return next.handle(textReq).pipe(
            map(event => {
                if (!(event instanceof HttpResponse) || typeof event.body !== 'string' || event.body.length === 0) {
                    return event;
                }

                const originalBody = event.body;
                try {
                    const body = JSON.parse(
                        originalBody.replace(SERIAL_NUMBER_PATTERN, '"serialNumber":"$1"')
                    );
                    return event.clone({body});
                } catch (error) {
                    throw new HttpErrorResponse({
                        error: {error, text: originalBody},
                        headers: event.headers,
                        status: event.status,
                        statusText: event.statusText,
                        url: event.url ?? undefined,
                    });
                }
            })
        );
    }
}
