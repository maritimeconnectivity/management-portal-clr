import { ColumnForResource } from "./columnForMenu";
import { migrateVesselAttributes } from "./filterObject";
import { ItemType } from "./menuType";

export const preprocess = (item: any, itemType: ItemType): any => {
    if (itemType === ItemType.Vessel) {
        return migrateVesselAttributes(item);
    } else if (itemType === ItemType.Instance) {
        return { ...item, 
            serviceTypeValue: item.serviceType.join(", "),
            dataProductTypeValue: item.dataProductType.join(", "),
        }
    }
    return item;
}

export const preprocessToShow = (item: any, itemType: ItemType): any => {
    if (itemType === ItemType.Instance) {
        // service type title injection
        let result = (ColumnForResource[itemType] as any).serviceType.options.filter((o: any) => item.serviceType.includes(o.value));
        item.serviceTypeTitle = result.map((o: any) => o.title);

        // data product type title injection
        let result2 = (ColumnForResource[itemType] as any).dataProductType.options.filter((o: any) => item.dataProductType.includes(o.value));
        item.dataProductTypeTitle = result2.map((o: any) => o.title);
    }
    return item;
}