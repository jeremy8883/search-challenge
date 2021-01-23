const stringToBoolean = (str: string) => {
  const strLower = str.toLowerCase()
  return strLower === "true" || strLower === "t"
    ? true
    : strLower === "false" || strLower === "f"
    ? false
    : // Safely return null, if the user has entered an invalid boolean value
      null
}

const matchesSearch = (value, searchTerm) => {
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

export const searchList = (
  items: unknown[],
  fieldName: string,
  searchTerm: string
) => {
  return items.filter((item) => matchesSearch(item[fieldName], searchTerm))
}
