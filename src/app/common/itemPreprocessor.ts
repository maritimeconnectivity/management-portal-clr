import { ColumnForResource } from "./columnForMenu";
import { migrateVesselAttributes } from "./filterObject";
import { ItemType } from "./menuType";

export const preprocess = (item: any, itemType: ItemType): any => {
    if (itemType === ItemType.Vessel) {
        return migrateVesselAttributes(item);
    } else if (itemType === ItemType.Instance) {
        return { ...item,
            serviceTypeValue: item.serviceType ? Array.isArray(item.serviceType) ? item.serviceType.join(", ") : item.serviceType : "",
            dataProductTypeValue: item.dataProductType ? Array.isArray(item.dataProductType) ? item.dataProductType.join(", ") : item.dataProductType : "",
        }
    }
    return item;
}

export const preprocessToUpload = (item: any, itemType: ItemType): any => {
    if (itemType === ItemType.Instance) {
        return {...item, 
            instanceAsDoc: typeof item.instanceAsDoc === 'string' ? null: item.instanceAsDoc,
            instanceAsXml: typeof item.instanceAsXml === 'string' ? null: item.instanceAsXml,
            keywords: item.keywords.length > 0 ? item.keywords.split(",") : [],
        }
    }
}

export const preprocessToShow = (item: any, itemType: ItemType): any => {
    if (itemType === ItemType.Instance) {
        // when we receive the data from the backend, we need to convert the array to object for serviceType and dataProductType
        // store the list of values
        const serviceType = item.serviceType;
        const dataProductType = item.dataProductType;

        // then convert the array of string to object
        item.serviceType = item.serviceType ? Array.isArray(item.serviceType) ? item.serviceType.map((serviceType: string) => {
            const filtered = (ColumnForResource[itemType] as any).serviceType.options.filter((o: any) => o.value === serviceType);
            // if we don't find the value, we set it to other
            return filtered.length > 0 ? filtered.pop() : {value: serviceType, title: 'Other'};
        }   ): [] : [];
        item.dataProductType = item.dataProductType ? Array.isArray(item.dataProductType) ? (ColumnForResource[itemType] as any).dataProductType.options.filter((o: any) => item.dataProductType.includes(o.value)) : [] : [];

        // then service type title injection
        let result = serviceType ? Array.isArray(serviceType) ? serviceType.map((_serviceType: string) => {
            const filtered = (ColumnForResource[itemType] as any).serviceType.options.filter((o: any) => o.value === _serviceType);
            // if we don't find the value, we set it to other
            return filtered.length > 0 ? filtered.pop().title : _serviceType;
        }   ): [] : [];
        item.serviceTypeTitle = result;

        // data product type title injection
        let result2 = (ColumnForResource[itemType] as any).dataProductType.options.filter((o: any) => dataProductType.includes(o.value));
        item.dataProductTypeTitle = result2.map((o: any) => o.title);
        
        item.instanceAsDocName = item.instanceAsDoc ? '' : undefined;
        item.instanceAsXmlName = item.instanceAsXml ? '' : undefined;
        console.log(item);
    }
    return item;
}