import chalk from "chalk"
import { newError } from "./utils/error"
import { ErrorCode } from "./constants/errorCode"
import { showLoader } from "./utils/cli"
import pressAnyKey from "press-any-key"

const getValueToDisplay = (value: string): string => {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  )
    return value
  // Make it clear, that null is different to a string that happens to equal "null"
  if (value === null) {
    return chalk.bold(`<< ${value} >>`)
  }
  return JSON.stringify(value)
}

const getKeyToDisplay = (key: string, searchItemKey: string): string => {
  // Highlight the key that the user searched for
  return key === searchItemKey ? chalk.greenBright.bold(key) : chalk.bold(key)
}

const displayPageResults = (
  items: unknown[],
  itemKey: string,
  log = console.log
): void => {
  items.forEach((item) => {
    Object.entries(item).forEach(([key, value]) => {
      log(`${getKeyToDisplay(key, itemKey)}: ${getValueToDisplay(value)}`)
    })
    log(chalk.gray("--"))
  })
}

const awaitToContinueFromKeyboard = async (
  pageNumber: number
): Promise<void> => {
  try {
    await pressAnyKey(
      `Showing page ${pageNumber}. Press any key for next page, or CTRL+C to exit`,
      { ctrlC: "reject" }
    )
  } catch (error) {
    throw newError("User exited", ErrorCode.cancelledByUser)
  }
}

/**
 * Shows a paginated list of the search results.
 * To allow for pagination, it will call the passed in iterator, one call at a time.
 * To proceed to the next call, the user must press any key.
 * The user may also cancel the search iteration by pressing "ctrl + c"
 */
export const showSearchResults = async (
  iterator: Generator<object[], object[]>,
  itemKey: string,
  dbEntryCount: number, // The total number of database entries, outside of the search results
  log = console.log,
  awaitToContinue = awaitToContinueFromKeyboard
) => {
  let hideLoader
  try {
    hideLoader = showLoader()
    let result = iterator.next()
    hideLoader()
    let resultsCount = result.value.length
    let pageNumber = 1

    log(chalk.gray("----"))
    if (!result.value.length) {
      log(chalk.italic(`No results found out of ${dbEntryCount} entries`))
      return
    }

    displayPageResults(result.value, itemKey, log)

    // If there are more results, await the user to press any key.
    // Then display the next page.
    // There's one bug, where if there are 10 results, and we're displaying 10 entries
    // at a time, we'll unnecessarily ask the user to press a key. I didn't get around
    // to fixing this.
    while (!result.done) {
      await awaitToContinue(pageNumber)
      hideLoader = showLoader()
      result = iterator.next()
      hideLoader()
      pageNumber++
      resultsCount += result.value.length
      displayPageResults(result.value, itemKey, log)
    }

    log(
      chalk.bold(`Number of results: `) +
        resultsCount +
        ", " +
        chalk.bold("Entries scanned: ") +
        dbEntryCount
    )
  } catch (error) {
    if (error.code == null) {
      error.code = ErrorCode.searchError
    }
    throw error
  } finally {
    if (hideLoader) hideLoader()
  }
}
