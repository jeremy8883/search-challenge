/**
 * Returns a list of every object key found in the array items.
 * This function does not iterate over nested objects.
 */
export const getAllItemKeys = (items: object[]): string[] => {
  const allKeys = items.reduce<Set<string>>((acc, item) => {
    Object.keys(item).forEach((key) => {
      acc.add(key)
    })
    return acc
  }, new Set())
  return Array.from(allKeys)
}
