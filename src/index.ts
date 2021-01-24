import {
  askForDataFile,
  askForFieldName,
  askForSearchTerm,
  showLoader,
  showSearchResults,
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

  const hideLoader = showLoader()
  const items = await loadDatabase(path.join(databaseDirectory, dataFileName))
  const allPossibleKeys = getAllItemKeys(items)
  hideLoader()

  const fieldName = await askForFieldName(allPossibleKeys)

  const searchTerm = await askForSearchTerm()

  await showSearchResults(
    searchList(items, fieldName, searchTerm),
    fieldName,
    items.length
  )
}

;(async () => {
  try {
    await run("./database")
  } catch (error) {
    // ie. the user presses Ctrl + C whilst prompted with a question.
    // Sometimes the escape key also triggers this, but I found some inconsistencies
    // with the `prompts` library that we're using.
    if (error.code === ErrorCode.cancelledByUser) {
      console.log("Goodbye! 👋")
    } else {
      console.error("An error occurred:")
      console.error(error)
    }
  }
})()
