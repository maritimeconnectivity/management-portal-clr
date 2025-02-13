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

export const toCamelCase = (sentence: string): string =>{
    // Split the sentence into words
    const words = sentence.split(' ');
  
    // Convert the first word to lowercase
    const camelCaseWords = [words[0].toLowerCase()];
  
    // Capitalize the first letter of each subsequent word
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      camelCaseWords.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    }
  
    // Join the words together to form the camel case variable name
    return camelCaseWords.join('');
}