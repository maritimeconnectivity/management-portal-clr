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

import {Component, OnInit} from '@angular/core';
import 'src/assets/js/wasm_exec.js';

@Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet><notifier-container></notifier-container>',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'management-portal-clr';

    ngOnInit() {
        const go = new Go();
        WebAssembly.instantiateStreaming(fetch(window.location.origin + "/assets/wasm/main.wasm"), go.importObject)
            .then(result => {
                console.log("Loaded WASM");
                go.run(result.instance).then(() => console.log("Finished"));
            });
    }
}
