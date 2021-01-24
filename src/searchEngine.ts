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

const matchesSearch = (value: unknown, searchTerm: string): boolean => {
  if (searchTerm === null) {
    return value === null
  } else if (typeof value === "string") {
    return value === searchTerm
  } else if (typeof value === "number") {
    return `${value}` === searchTerm
  } else if (typeof value === "boolean") {
    return value === stringToBoolean(searchTerm)
  } else if (R.is(Array, value)) {
    return (value as unknown[]).some((item) => matchesSearch(item, searchTerm))
  } else if (R.is(Object, value)) {
    return Object.values(value).some((item) => matchesSearch(item, searchTerm))
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
  for (const item of items) {
    if (matchesSearch(item[fieldName], searchTerm)) {
      pageItems.push(item)

      if (pageItems.length === pageSize) {
        yield pageItems
        pageItems = []
      }
    }
  }
  return pageItems
}
