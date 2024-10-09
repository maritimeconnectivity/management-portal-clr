export const sortColumnForMenu = (a: any, b: any) => {
    return a.order > b.order ? -1 : 1;
}