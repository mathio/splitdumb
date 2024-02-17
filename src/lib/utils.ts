export const sortBy =
  (field: string, desc = false) =>
  (a: any, b: any) =>
    (a[field] - b[field]) * (desc ? -1 : 1);
