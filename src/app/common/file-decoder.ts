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

export const encodeFileToBase64 = (file: File): Promise<{ file: File, content: string }> => {
    var fileReader = new FileReader();
    return new Promise((resolve, reject) => {
        console.log('file', file);
        fileReader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target && typeof e.target.result === 'string') {
                const result = e.target.result;
                const base64Data = result.substring(result.indexOf('base64,') + 'base64,'.length);
                resolve({ file: file, content: base64Data });
            } else {
                reject(new Error('File reading failed'));
            }
        }
        fileReader.readAsDataURL(file)
     });
}