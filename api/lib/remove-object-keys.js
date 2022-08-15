/**
 * basically the same is `lodash.omit` but simpler given the context
 * of this library
 */
export function removeObjectKeys(obj, keys) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key))
  );
}
