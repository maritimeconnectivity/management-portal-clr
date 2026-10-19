import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ClarityModule} from '@clr/angular';
import {
    SignaturePasswordRequest,
    SignatureProviderError,
    SignatureProviderErrorCode
} from "../../common/shared/certificate-provider.service";

@Component({
    selector: 'app-password-prompt-modal',
    standalone: true,
    imports: [
        ClarityModule,
        FormsModule
    ],
    templateUrl: './password-prompt-modal.component.html',
    styleUrl: './password-prompt-modal.component.css'
})
export class PasswordPromptModalComponent {
    modalOpen = false;
    modalTitle = '';
    modalMessage = '';
    confirmRequired = false;
    passwordValue = '';
    passwordConfirmationValue = '';
    validationMessage: string | null = null;
    private requestResolver: ((password: string) => void) | null = null;
    private requestRejecter: ((reason?: unknown) => void) | null = null;

    open(request: SignaturePasswordRequest): Promise<string> {
        this.modalTitle = request.mode === 'create' ? 'Create Certificate Password' : 'Unlock Certificate';
        this.modalMessage = request.message;
        this.confirmRequired = request.requireConfirmation;
        this.passwordValue = '';
        this.passwordConfirmationValue = '';
        this.validationMessage = null;
        this.modalOpen = true;

        return new Promise<string>((resolve, reject) => {
            this.requestResolver = resolve;
            this.requestRejecter = reject;
        });
    }

    submit(): void {
        const password = this.passwordValue.trim();
        if (!password) {
            this.validationMessage = 'A non-empty password is required.';
            return;
        }

        if (this.confirmRequired && password !== this.passwordConfirmationValue) {
            this.validationMessage = 'The passwords did not match.';
            return;
        }

        this.modalOpen = false;
        this.validationMessage = null;
        this.requestResolver?.(password);
        this.requestResolver = null;
        this.requestRejecter = null;
    }

    cancel(): void {
        this.cancelPendingRequest();
    }

    cancelPendingRequest(): void {
        this.modalOpen = false;
        this.validationMessage = null;
        this.passwordValue = '';
        this.passwordConfirmationValue = '';
        this.requestRejecter?.(new SignatureProviderError(
            SignatureProviderErrorCode.PasswordCancelled,
            'Password entry was cancelled'
        ));
        this.requestResolver = null;
        this.requestRejecter = null;
    }
}
