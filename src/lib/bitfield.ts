export function bitfieldValueToObject<T extends string>(bitfield: Map<number, T>, value: number): Set<T> {
  const result = new Set<T>();

  for (const [k, v] of bitfield) {
    if ((value & k) === 1) result.add(v);
  }

  return result;
}
