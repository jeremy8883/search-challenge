import { readFile as readFileFromFileSystem } from "./utils/file"
import { newError } from "./utils/error"
import { ErrorCode } from "./constants/errorCode"
import * as R from "ramda"

/**
 * There are certain assumptions that this script makes about the json files that are
 * read. This function validates these assumptions.
 */
const validateData = (data: unknown): void => {
  if (!Array.isArray(data)) {
    throw newError(
      "JSON database file must be an array",
      ErrorCode.invalidInput
    )
  }
  const nonObjectItem = data.find((item) => !R.is(Object, item))
  if (nonObjectItem) {
    throw newError("Array entries must all be objects", ErrorCode.invalidInput)
  }
}

export const loadDatabase = async (
  location: string,
  readFile: (
    location: string,
    type: string
  ) => Promise<string> = readFileFromFileSystem
): Promise<object[]> => {
  const data = await readFile(location, "utf-8")
  const parsedData = JSON.parse(data)
  validateData(parsedData)
  return parsedData as object[] // We've validated the data from the JSON file, so we can safely cast this value
}
