import { formatVesselToUpload } from "./dataformatter";
import { ItemType } from "./menuType";

export const postprocess = (item: any, itemType: ItemType): any => {
    if (itemType === ItemType.Vessel) {
        return formatVesselToUpload(item);
    }
    return item;
}