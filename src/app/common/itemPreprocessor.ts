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

import { ColumnForResource } from "./columnForMenu";
import { formatVesselToUpload } from "./dataformatter";
import { migrateVesselAttributes } from "./filterObject";
import { ItemType } from "./menuType";

export const preprocess = (item: any, itemType: ItemType): any => {
    if (itemType === ItemType.Vessel) {
        return migrateVesselAttributes(item);
    } else if (itemType === ItemType.Instance) {
        // when we receive the data from the backend, we need to convert the array to object for serviceType and dataProductType
        // store the list of values

        let serviceTypeStringArray = item.serviceType;
        let dataProductTypeStringArray = item.dataProductType;

        
        if (item.serviceType && !Array.isArray(item.serviceType) || !item.serviceType.every((type: any) => typeof type === 'string')) {
            // if the serviceType is already an array of object, we convert it to an array of string
            serviceTypeStringArray = item.serviceType.map( (e: any) => e.value);
        } else if (item.serviceType){
            // if the serviceType is an array of string, we convert it to an array of object

            // then convert the array of string to object
            serviceTypeStringArray = item.serviceType; // save this for later
            // actual conversion
            item.serviceType = item.serviceType ? Array.isArray(item.serviceType) ? item.serviceType.map((_serviceType: string) => {
                const filtered = (ColumnForResource[itemType] as any).serviceType.options.filter((o: any) => o.value === _serviceType);
                // if we don't find the value, we set it to other
                return filtered.length > 0 ? filtered.pop() : {value: _serviceType, title: 'Other'};
            }): [] : [];
        } else {
            serviceTypeStringArray = [];
        }

        if (item.dataProductType && !Array.isArray(item.dataProductType) || !item.dataProductType.every((type: any) => typeof type === 'string')) {
            // if the dataProductType is already an array of object, we convert it to an array of string
            dataProductTypeStringArray = item.dataProductType.map( (e: any) => e.value);
        } else if (item.dataProductType){
            // if the dataProductType is an array of string, we convert it to an array of object

            // then convert the array of string to object
            dataProductTypeStringArray = item.dataProductType; // save this for later
            // actual conversion
            item.dataProductType = item.dataProductType ? Array.isArray(item.dataProductType) ? item.dataProductType.map((_dataProductType: string) =>{
                const filtered = (ColumnForResource[itemType] as any).dataProductType.options.filter((o: any) => o.value === _dataProductType);
                // if we don't find the value, we set it to other
                return filtered.length > 0 ? filtered.pop() : {value: _dataProductType, title: 'Other'};
            }) : [] : [];
        } else {
            dataProductTypeStringArray = [];
        }

        item.keywords = item.keywords ? item.keywords.filter((e: string) => e.length > 0) : [];

        return { ...item,
            serviceTypeValue: serviceTypeStringArray ? Array.isArray(serviceTypeStringArray) ? serviceTypeStringArray.join(", ") : serviceTypeStringArray : "",
            dataProductTypeValue: dataProductTypeStringArray ? Array.isArray(dataProductTypeStringArray) ? dataProductTypeStringArray.join(", ") : dataProductTypeStringArray : "",
        }
    }
    return item;
}

export const preprocessToUpload = (item: any, itemType: ItemType): any => {
    if (itemType === ItemType.Vessel) {
        return formatVesselToUpload(item);
    } else if (itemType === ItemType.Instance) {
        return {
            ...item,
            dataProductType: item["dataProductType"] && Array.isArray(item["dataProductType"]) 
            ? item["dataProductType"].map((d: any) => d.value).filter((d: any) => d !== undefined) 
            : [],
            serviceType: item["serviceType"] && Array.isArray(item["serviceType"]) 
            ? item["serviceType"].map((d: any) => d.value).filter((d: any) => d !== undefined) 
            : [],
            instanceAsDoc: typeof item.instanceAsDoc === 'string' ? null : item.instanceAsDoc,
            instanceAsXml: typeof item.instanceAsXml === 'string' ? null : item.instanceAsXml,
            comment: item.comment ? item.comment : '',
            keywords: typeof item.keywords === 'string' 
            ? item.keywords.length > 0 
                ? item.keywords.split(",") 
                : [] 
            : item.keywords,
        }
    }
    return item;
}

export const preprocessToShow = (item: any, itemType: ItemType): any => {
    if (itemType === ItemType.Instance) {
        item.instanceAsDocName = item.instanceAsDoc ? '' : undefined;
        if (!item.instanceAsXmlName || item.instanceAsXmlName.length === 0) {
            item.instanceAsXmlName = item.instanceAsXml ? '' : undefined;
        }        
    }
    return item;
}