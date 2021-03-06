import {
  askForDataFileName,
  askForItemKey,
  askForSearchTerm,
} from "./cliInitialPrompts"
import { searchList } from "./searchEngine"
import { getAllItemKeys } from "./utils/object"
import { ErrorCode } from "./constants/errorCode"
import { getDataFileNames, loadDatabase } from "./database"
import * as path from "path"
import chalk from "chalk"
import { showSearchResults } from "./cliSearchResults"
import { showLoader } from "./utils/cli"

const run = async (databaseDirectory) => {
  console.log("Welcome to the search engine coding challenge!")
  console.log("Press Ctrl + C to quit")

  let hideLoader

  try {
    const dataFileNames = await getDataFileNames(databaseDirectory)
    const dataFileName = await askForDataFileName(dataFileNames)

    hideLoader = showLoader()
    const items = await loadDatabase(path.join(databaseDirectory, dataFileName))
    const allPossibleKeys = getAllItemKeys(items)
    hideLoader()

    const itemKey = await askForItemKey(allPossibleKeys)

    const searchTerm = await askForSearchTerm()

    await showSearchResults(
      searchList(items, itemKey, searchTerm),
      itemKey,
      items.length
    )
  } finally {
    if (hideLoader) hideLoader()
  }
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
      return
    }

    if (error.code === ErrorCode.invalidJsonData) {
      console.error(chalk.red("There was a problem with the JSON data"))
    } else if (error.code === ErrorCode.ioError) {
      console.error(
        chalk.red("There was a problem reading from the file system")
      )
    } else if (error.code === ErrorCode.searchError) {
      console.error(
        chalk.red("There was a problem searching through the results")
      )
    } else {
      console.error(chalk.red("An error occurred!"))
    }
    console.error(error)
  }
})()
