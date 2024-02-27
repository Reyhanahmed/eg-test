export function excludePrismaFields<T extends object, Key extends keyof T>(
  model: T,
  fields: Key[],
): Omit<T, Key> {
  const result = Object.fromEntries(
    Object.entries(model).filter(([key]) => !fields.includes(key as Key)),
  ) as Omit<T, Key>;

  console.log('<><>< ', result);
  return result;
}
