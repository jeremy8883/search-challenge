import * as R from "ramda"

const stringToBoolean = (str: string): boolean | null => {
  const strLower = str.toLowerCase()
  return strLower === "true" || strLower === "t"
    ? true
    : strLower === "false" || strLower === "f"
    ? false
    : // Safely return null, if the user has entered an invalid boolean value
      null
}

const normalize = (string: string): string => {
  return (
    string
      .trim()
      .toLowerCase()
      // Replace accented characters with their plain equivelants. eg. è becomes e
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  )
}

const matchesSearch = (
  value: unknown,
  normalizedSearchTerm: string
): boolean => {
  if (normalizedSearchTerm === null) {
    return value === null
  } else if (typeof value === "string") {
    return normalize(value) === normalizedSearchTerm
  } else if (typeof value === "number") {
    return `${value}` === normalizedSearchTerm
  } else if (typeof value === "boolean") {
    return value === stringToBoolean(normalizedSearchTerm)
  } else if (R.is(Array, value)) {
    return (value as unknown[]).some((item) =>
      matchesSearch(item, normalizedSearchTerm)
    )
  } else if (R.is(Object, value)) {
    return Object.values(value).some((item) =>
      matchesSearch(item, normalizedSearchTerm)
    )
  } else {
    // This covers anything else that we don't support.
    // eg. we don't search for null values (yet)
    return false
  }
}

// Searches through a list of items. It will yield 10 results at a time.
export function* searchList<T extends object>(
  items: T[],
  fieldName: string,
  searchTerm: string,
  pageSize = 10
): Generator<T[], T[]> {
  let pageItems = []
  const normalizedSearchTerm = normalize(searchTerm)
  for (const item of items) {
    if (matchesSearch(item[fieldName], normalizedSearchTerm)) {
      pageItems.push(item)

      if (pageItems.length === pageSize) {
        yield pageItems
        pageItems = []
      }
    }
  }
  return pageItems
}
