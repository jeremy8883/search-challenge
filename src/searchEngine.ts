import * as R from "ramda"
import { newError } from "./utils/error"
import { ErrorCode } from "./constants/errorCode"
import { isPlainObject } from "is-plain-object"

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
      // Removes all combining diacritical marks, required for the accents to be removed
      .replace(/[\u0300-\u036f]/g, "")
  )
}

const matchesSearch = (
  value: unknown,
  normalizedSearchTerm: string
): boolean => {
  if (normalizedSearchTerm === "<<null>>") {
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
  } else if (isPlainObject(value)) {
    return Object.values(value).some((item) =>
      matchesSearch(item, normalizedSearchTerm)
    )
  } else {
    // Hopefully this never happens. We should have covered
    // all json data types. Maybe a function got inserted into the data
    // file by accident, somewhere else in the code. Or maybe this
    // function was called with the value being `undefined`.
    throw newError(`Unsupported data type ${value}`, ErrorCode.invalidJsonData)
  }
}

/**
 * A generator function that searches through a list of items. It will yield 10
 * results at a time.
 *
 * Search results are normalized, so it's case insensitive, whitespace is trimmed,
 * and it's accent insensitive.
 *
 * To search for null, use `<<NULL>>` for the search term. For booleans, use
 * `true` or `false`
 */
export function* searchList<T extends object>(
  items: T[],
  itemKey: string,
  searchTerm: string,
  pageSize = 10
): Generator<T[], T[]> {
  let pageItems = []
  const normalizedSearchTerm = normalize(searchTerm)
  for (const item of items) {
    if (
      // Ignore entries where the property does not exist
      item.hasOwnProperty(itemKey) &&
      matchesSearch(item[itemKey], normalizedSearchTerm)
    ) {
      pageItems.push(item)

      if (pageItems.length === pageSize) {
        yield pageItems
        pageItems = []
      }
    }
  }
  return pageItems
}
