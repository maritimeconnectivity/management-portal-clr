import { migrateVesselAttributes } from "./filterObject";
import { ItemType } from "./menuType";

export const preprocess = (item: any, itemType: ItemType): any => {
    if (itemType === ItemType.Vessel) {
        return migrateVesselAttributes(item);
    }
    return item;
}