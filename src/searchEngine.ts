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
  if (searchTerm === "") {
    return value === ""
  } else if (typeof value === "string") {
    return value.includes(searchTerm)
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

export const searchList = <T extends object>(
  items: T[],
  fieldName: string,
  searchTerm: string
): T[] => {
  return items.filter((item) => matchesSearch(item[fieldName], searchTerm))
}
