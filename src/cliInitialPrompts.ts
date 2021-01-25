import prompts from "prompts"
import { newError } from "./utils/error"
import { ErrorCode } from "./constants/errorCode"

// This file includes the functions that ask the user the initial questions,
// and returns those answers

export const askForDataFileName = async (files: string[]): Promise<string> => {
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

export const askForItemKey = async (itemKeys: string[]): Promise<string> => {
  let isAborted = false
  const { itemKey } = await prompts({
    type: "autocomplete",
    name: "itemKey",
    message: "Enter field name",
    choices: itemKeys.map((fn) => ({ title: fn, value: fn })),
    onState: (state) => {
      isAborted = state.aborted
    },
  })

  if (isAborted) {
    throw newError("Cancelled by user", ErrorCode.cancelledByUser)
  }
  if (itemKey == null) {
    console.log("Field name not found")
    return await askForItemKey(itemKeys)
  }
  return itemKey
}

export const askForSearchTerm = async (): Promise<string> => {
  const { searchTerm } = await prompts({
    type: "text",
    name: "searchTerm",
    message:
      'Enter search term (enter "true" or "false" for booleans, "<<NULL>>" for null values, "<<UNDEFINED>>" to search for where that field does not exist, or nothing for empty strings)',
  })
  if (searchTerm == null) {
    throw newError("Cancelled by user", ErrorCode.cancelledByUser)
  }
  return searchTerm
}
