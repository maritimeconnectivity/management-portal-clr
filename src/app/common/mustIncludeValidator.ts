import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// A string that includes the pattern is valid, while a string that is identical to the pattern or does not include the pattern is invalid.
export function mustIncludePatternValidator(pattern: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    const value = control.value;
    if (value && (!pattern.test(value) || value === pattern.source)) {
      return { mustIncludePattern: { value: control.value } }; // not valid
    }
    return null; // valid
  };
}