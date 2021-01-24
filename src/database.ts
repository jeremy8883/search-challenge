import {
  readDirectory as readDirectoryFromFileSystem,
  readFile as readFileFromFileSystem,
} from "./utils/file"
import { newError } from "./utils/error"
import { ErrorCode } from "./constants/errorCode"
import * as R from "ramda"

export const getDataFileNames = async (
  databaseDirectory: string,
  readDirectory: (
    location: string
  ) => Promise<string[]> = readDirectoryFromFileSystem
) => {
  const files = await readDirectory(databaseDirectory)
  return files.filter((f) => f.toLowerCase().endsWith(".json"))
}

/**
 * There are certain assumptions that this script makes about the json files that are
 * read. This function validates these assumptions.
 */
const validateData = (data: unknown): void => {
  if (!Array.isArray(data)) {
    throw newError(
      "JSON database file must be an array",
      ErrorCode.invalidJsonData
    )
  }
  const nonObjectItem = data.find((item) => !R.is(Object, item))
  if (nonObjectItem) {
    throw newError(
      "JSON array entries must all be objects",
      ErrorCode.invalidJsonData
    )
  }
}

export const loadDatabase = async (
  location: string,
  readFile: (
    location: string,
    type: string
  ) => Promise<string> = readFileFromFileSystem
): Promise<object[]> => {
  let data
  try {
    data = await readFile(location, "utf-8")
  } catch (error) {
    error.code = ErrorCode.ioError
    throw error
  }
  let parsedData
  try {
    parsedData = JSON.parse(data)
  } catch (error) {
    error.code = ErrorCode.invalidJsonData
    throw error
  }
  validateData(parsedData)
  return parsedData as object[] // We've validated the data from the JSON file, so we can safely cast this value
}
