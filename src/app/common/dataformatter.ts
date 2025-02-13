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

import { VesselAttribute } from "../backend-api/identity-registry/model/vesselAttribute";

export const formatData = (data: any): any => {
  const menuData: { [key: string]: any } = {}; // Add type annotation for menuData
  for (const key in data) {
    if (key === "attributes") {
      // for vessel
      for (const attr_key in data[key]) {
        const attributeName = camel2snake(data[key][attr_key].attributeName);
        if (
          Object.values(VesselAttribute.AttributeNameEnum).find(
            (e) => e === attributeName
          )
        ) {
          menuData[snake2camel(attributeName)] =
            data[key][attr_key].attributeValue;
        }
      }
    } else {
      menuData[key] = data[key];
    }
  }
  return menuData;
};

export const formatInstanceData = (data: any): any => {
    const menuData: { [key: string]: any } = {}; // Add type annotation for menuData
  for (const key in data) {
    menuData[key] = data[key];
  }
  return menuData;
};

export const formatVesselToUpload = (vesselData: any): any => {
  const attributes = [];
  for (const key in vesselData) {
    const attributeName = camel2snake(key);
    if (
      Object.values(VesselAttribute.AttributeNameEnum).find(
        (e) => e === attributeName
      )
    ) {
      attributes.push({
        createdAt: new Date(),
        updatedAt: new Date(),
        attributeName: attributeName,
        attributeValue: vesselData[key],
      });
      delete vesselData[key];
    }
  }
  vesselData["attributes"] = attributes;
  return vesselData;
};

const snake2camel = (input: string): string =>
  input
    .split("-")
    .reduce(
      (res, word, i) =>
        i === 0
          ? word.toLowerCase()
          : `${res}${word.charAt(0).toUpperCase()}${word
              .substr(1)
              .toLowerCase()}`,
      ""
    );

const camel2snake = (str: string): string =>
  str.replace(/[A-Z]/g, (constter) => `-${constter.toLowerCase()}`);
