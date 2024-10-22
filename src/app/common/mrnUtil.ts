import { ItemType } from "./menuType";

export const getMrnPrefixFromOrgMrn = (orgMrn: string, itemType: ItemType): string => {
    const list = orgMrn.split(':');
    return list.slice(0,3).join(':')+':'+itemType+":"+list.slice(4,6).join(':')+":";
}