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

export const filterUndefinedAttributes = (entity: {}) => Object.fromEntries(Object.entries(entity).filter(([key, value]) => value !== undefined && typeof value === 'string' ? value!.toString().length > 0 : true))

export const appendUpdatedAttributes = (original: any, updates: any, attributes: any): any => {
    const updatedItem = { ...original };
    for (const key in updates) {
      if (attributes.hasOwnProperty(key)) {
        updatedItem[key] = updates[key];
      }
    }
    return updatedItem;
  }

export const migrateVesselAttributes = (item: any) => {
  return { ...item, ...item.attributes.reduce((acc: any, attr: any) => ({ ...acc, [attr.attributeName.replace(/-([a-z])/g, function (g: any) { return g[1].toUpperCase(); })]: attr.attributeValue }), {})};
}