import { readDirectory, readJsonFile } from "./utils/file"
import {
  askForDataFile,
  askForFieldName,
  askForSearchTerm,
  printSearchResults,
} from "./cliPrompts"
import * as path from "path"
import { searchList } from "./searchEngine"
import { getAllItemKeys } from "./utils/object"
import { ErrorCode } from "./constants/errorCode"

const run = async (databaseDirectory) => {
  console.log("Welcome to the search engine coding challenge!")
  console.log("Press Ctrl + C to quit")

  const files = await readDirectory(databaseDirectory)
  const dataFileName = await askForDataFile(files)

  const items = await readJsonFile(path.join(databaseDirectory, dataFileName))
  const allPossibleKeys = getAllItemKeys(items)
  const fieldName = await askForFieldName(allPossibleKeys)

  const searchTerm = await askForSearchTerm()

  const results = searchList(items, fieldName, searchTerm)
  printSearchResults(results)
}

;(async () => {
  try {
    await run("./database")
  } catch (error) {
    if (error.code === ErrorCode.cancelledByUser) {
      console.log("Goodbye!")
    } else {
      console.error("An error occurred:")
      console.error(error)
    }
  }
})()
