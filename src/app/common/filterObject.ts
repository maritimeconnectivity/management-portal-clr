export const filterUndefinedAttributes = (entity: {}) => Object.fromEntries(Object.entries(entity).filter(([key, value]) => value !== undefined && typeof value === 'string' ? value!.toString().length > 0 : true))

export const appendUpdatedAttributes = (original: any, updates: any, attributes: any): any => {
    const updatedItem = { ...original };
    for (const key in updates) {
      if (attributes.hasOwnProperty(key)) {
        updatedItem[key] = updates[key];
      }
    }
    return updatedItem;
  }

export const migrateVesselAttributes = (item: any) => {
  return { ...item, ...item.attributes.reduce((acc: any, attr: any) => ({ ...acc, [attr.attributeName.replace(/-([a-z])/g, function (g: any) { return g[1].toUpperCase(); })]: attr.attributeValue }), {})};
}