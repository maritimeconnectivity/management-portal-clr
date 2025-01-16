import { formatVesselToUpload } from "./dataformatter";
import { ItemType } from "./menuType";

export const postprocess = (item: any, itemType: ItemType): any => {
    if (itemType === ItemType.Vessel) {
        return formatVesselToUpload(item);
    } else if (itemType === ItemType.Instance) {
        item = {
            ...item,
            dataProductType:
                item["dataProductType"] &&
                    Array.isArray(item["dataProductType"]) ? item["dataProductType"].map((d: any) => d.value) : [],
            serviceType:
                item["serviceType"] &&
                    Array.isArray(item["serviceType"]) ? item["serviceType"].map((d: any) => d.value) : [],
        }
    }
    return item;
}