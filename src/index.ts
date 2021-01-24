import {
  askForDataFile,
  askForFieldName,
  askForSearchTerm,
  printSearchResults,
} from "./cliPrompts"
import { searchList } from "./searchEngine"
import { getAllItemKeys } from "./utils/object"
import { ErrorCode } from "./constants/errorCode"
import { getDataFileNames, loadDatabase } from "./database"
import * as path from "path"

const run = async (databaseDirectory) => {
  console.log("Welcome to the search engine coding challenge!")
  console.log("Press Ctrl + C to quit")

  const dataFileNames = await getDataFileNames(databaseDirectory)
  const dataFileName = await askForDataFile(dataFileNames)

  const items = await loadDatabase(path.join(databaseDirectory, dataFileName))
  const allPossibleKeys = getAllItemKeys(items)
  const fieldName = await askForFieldName(allPossibleKeys)

  const searchTerm = await askForSearchTerm()

  const results = searchList(items, fieldName, searchTerm)
  printSearchResults(results, fieldName, items.length)
}

;(async () => {
  try {
    await run("./database")
  } catch (error) {
    // ie. the user presses Ctrl + C whilst prompted with a question.
    // Sometimes the escape key also triggers this, but I found some inconsistencies
    // with the `prompts` library that we're using.
    if (error.code === ErrorCode.cancelledByUser) {
      console.log("Goodbye!")
    } else {
      console.error("An error occurred:")
      console.error(error)
    }
  }
})()
