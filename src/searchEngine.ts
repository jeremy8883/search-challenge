const stringToBoolean = (str: string): boolean | null => {
  const strLower = str.toLowerCase()
  return strLower === "true" || strLower === "t"
    ? true
    : strLower === "false" || strLower === "f"
    ? false
    : // Safely return null, if the user has entered an invalid boolean value
      null
}

const matchesSearch = (value: string, searchTerm: string): boolean => {
  if (searchTerm === "") {
    return value === ""
  } else if (typeof value === "string") {
    return value.includes(searchTerm)
  } else if (typeof value === "number") {
    return `${value}` === searchTerm
  } else if (typeof value === "boolean") {
    return value === stringToBoolean(searchTerm)
  }
}

export const searchList = <T extends object>(
  items: T[],
  fieldName: string,
  searchTerm: string
): T[] => {
  return items.filter((item) => matchesSearch(item[fieldName], searchTerm))
}
