import prompts from "prompts"
import { newError } from "./utils/error"
import { ErrorCode } from "./constants/errorCode"
import chalk from "chalk"
import { Spinner } from "cli-spinner"

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

export const printSearchResults = (
  items: unknown[],
  fieldName: string,
  dbEntryCount: number, // The total number of database entries, outside of the search results
  log = console.log
): void => {
  if (!items.length) {
    log(chalk.italic(`No results found out of ${dbEntryCount}`))
    return
  }
  log(chalk.gray("--"))
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
  log(
    chalk.bold(`Number of results: `) + items.length + " out of " + dbEntryCount
  )
}
