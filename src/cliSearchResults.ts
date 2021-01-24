import chalk from "chalk"
import { newError } from "./utils/error"
import { ErrorCode } from "./constants/errorCode"
import { showLoader } from "./utils/cli"
import pressAnyKey from "press-any-key"

const displayPageResults = (
  items: unknown[],
  fieldName: string,
  log = console.log
): void => {
  items.forEach((item) => {
    Object.entries(item).forEach(([key, value]) => {
      const valueToDisplay =
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
          ? value
          : value === null
          ? // Make it clear, that null is different to a string that happens to equal "null"
            chalk.bold(`<< ${value} >>`)
          : JSON.stringify(value)
      // Highlight the key that the user searched for
      const keyToDisplay =
        fieldName === key ? chalk.greenBright.bold(key) : chalk.bold(key)
      log(`${keyToDisplay}: ${valueToDisplay}`)
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
  } catch (ex) {
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
  fieldName: string,
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

    if (!result.value.length) {
      log(chalk.italic(`No results found out of ${dbEntryCount}`))
      return
    }

    displayPageResults(result.value, fieldName, log)

    while (!result.done) {
      await awaitToContinue(pageNumber)
      hideLoader = showLoader()
      result = iterator.next()
      hideLoader()
      pageNumber++
      resultsCount += result.value.length
      displayPageResults(result.value, fieldName, log)
    }

    log(
      chalk.bold(`Number of results: `) +
        resultsCount +
        " out of " +
        dbEntryCount
    )
  } catch (ex) {
    ex.code = ErrorCode.searchError
    throw ex
  } finally {
    if (hideLoader) hideLoader()
  }
}
