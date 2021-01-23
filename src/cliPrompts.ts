import prompts from "prompts"
import { newError } from "./utils/error"
import { ErrorCode } from "./constants/errorCode"

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
  log = console.log
): void => {
  if (!items.length) {
    log("No results found")
    return
  }
  log("--")
  items.forEach((item) => {
    Object.entries(item).forEach(([key, value]) => {
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        log(`${key}: ${value}`)
      } else {
        log(`${key}: ${JSON.stringify(value)}`)
      }
    })
    log("--")
  })
  log(`Number of results: ${items.length}`)
}
