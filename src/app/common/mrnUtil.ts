import { ItemType } from "./menuType";

export const getMrnPrefixFromOrgMrn = (orgMrn: string): string => {
    const list = orgMrn.split(':');
    return list.slice(0,3).join(':')+':entity:'+list.slice(4,6).join(':')+":";
}