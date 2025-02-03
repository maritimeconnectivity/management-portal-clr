import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const mrnRegex = (): string => 
    "urn:mrn:mcp:(entity|mir|mms|msr|device|org|user|vessel|service|mms):([a-z0-9]([a-z0-9]|-){0,20}[a-z0-9]):((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|)*)$";

export function mrnValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const regex = new RegExp(mrnRegex());
        const valid = regex.test(control.value);
        return valid ? null : { invalidMRN: true };
    };
}
