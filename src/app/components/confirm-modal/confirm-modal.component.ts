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

import {Component} from '@angular/core';
import {ClarityModule} from '@clr/angular';

export interface ConfirmModalOptions {
    title: string;
    message: string;
    /** Optional list of entries (e.g. names of the items affected) shown below the message */
    items?: string[];
    /** Optional extra warning shown in a danger alert */
    warning?: string;
    confirmText?: string;
    cancelText?: string;
}

/**
 * Generic confirmation dialog. Call {@link open} and await the result:
 * resolves to true when the user confirms and false when they cancel or close the dialog.
 */
@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [
        ClarityModule
    ],
    templateUrl: './confirm-modal.component.html',
    styleUrl: './confirm-modal.component.css'
})
export class ConfirmModalComponent {
    modalOpen = false;
    options: ConfirmModalOptions = {title: '', message: ''};
    private resolver: ((confirmed: boolean) => void) | null = null;

    open(options: ConfirmModalOptions): Promise<boolean> {
        // a dialog that is still pending gets cancelled before a new one is opened
        this.settle(false);
        this.options = options;
        this.modalOpen = true;
        return new Promise<boolean>(resolve => this.resolver = resolve);
    }

    confirm(): void {
        this.settle(true);
    }

    cancel(): void {
        this.settle(false);
    }

    onOpenChange(open: boolean): void {
        // closing through the X button or the escape key counts as cancelling
        if (!open) {
            this.settle(false);
        }
    }

    private settle(confirmed: boolean): void {
        this.modalOpen = false;
        const resolve = this.resolver;
        this.resolver = null;
        resolve?.(confirmed);
    }
}
