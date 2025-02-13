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