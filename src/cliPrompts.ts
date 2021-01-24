import prompts from "prompts"
import { newError } from "./utils/error"
import { ErrorCode } from "./constants/errorCode"
import chalk from "chalk"
import { Spinner } from "cli-spinner"
import pressAnyKey from "press-any-key"

export const askForDataFile = async (files: string[]): Promise<string> => {
  const { dataFileName } = await prompts({
    type: "select",
    name: "dataFileName",
    message: "Select datafile",
    choices: files.map((f) => ({ title: f, value: f })),
  })
  if (dataFileName == null) {
    throw newError("Cancelled by user", ErrorCode.cancelledByUser)
  }
  return dataFileName
}

export const showLoader = () => {
  const spinner = new Spinner("Processing.. %s")
  spinner.setSpinnerString("|/-\\")
  spinner.start()

  return () => {
    spinner.stop()
  }
}

export const askForFieldName = async (
  fieldNames: string[]
): Promise<string> => {
  let isAborted = false
  const { fieldName } = await prompts({
    type: "autocomplete",
    name: "fieldName",
    message: "Enter field name",
    choices: fieldNames.map((fn) => ({ title: fn, value: fn })),
    onState: (state) => {
      isAborted = state.aborted
    },
  })

  if (isAborted) {
    throw newError("Cancelled by user", ErrorCode.cancelledByUser)
  }
  if (fieldName == null) {
    console.log("Field name not found")
    return await askForFieldName(fieldNames)
  }
  return fieldName
}

export const askForSearchTerm = async (): Promise<string> => {
  const { searchTerm } = await prompts({
    type: "text",
    name: "searchTerm",
    message: "Enter search term",
  })
  if (searchTerm == null) {
    throw newError("Cancelled by user", ErrorCode.cancelledByUser)
  }
  return searchTerm
}

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

const awaitForNextPageFromKeyboard = async (
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
  awaitForNextPage = awaitForNextPageFromKeyboard
) => {
  let result = iterator.next()
  let resultsCount = result.value.length
  let pageNumber = 1

  if (!result.value.length) {
    log(chalk.italic(`No results found out of ${dbEntryCount}`))
    return
  }

  displayPageResults(result.value, fieldName, log)

  while (!result.done) {
    await awaitForNextPage(pageNumber)
    result = iterator.next()
    pageNumber++
    resultsCount += result.value.length
    displayPageResults(result.value, fieldName, log)
  }

  log(
    chalk.bold(`Number of results: `) + resultsCount + " out of " + dbEntryCount
  )
}
