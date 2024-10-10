export const filterUndefinedAttributes = (entity: {}) => Object.fromEntries(Object.entries(entity).filter(([key, value]) => value !== undefined))

export const appendUpdatedAttributes = (original: any, updates: any): any => {
    const updatedItem = { ...original };
    for (const key in updates) {
      if (updatedItem.hasOwnProperty(key) && updates[key] !== updatedItem[key]) {
        updatedItem[key] = updates[key];
      }
    }
    return updatedItem;
  }