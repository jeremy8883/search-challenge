import { readDirectory, readJsonFile } from "./utils/file"
import prompts from "prompts"
import * as path from "path"
import { searchList } from "./searchEngine"
import { getAllItemKeys } from "./utils/object"
import { newError } from "./utils/error"
import { ErrorCode } from "./constants/errorCode"

const askForDataFile = async (files: string[]): Promise<string> => {
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

const askForFieldName = async (fieldNames: string[]): Promise<string> => {
  const { fieldName } = await prompts({
    type: "autocomplete",
    name: "fieldName",
    message: "Enter field name",
    choices: fieldNames.map((fn) => ({ title: fn, value: fn })),
  })
  if (fieldName == null) {
    throw newError("Cancelled by user", ErrorCode.cancelledByUser)
  }
  return fieldName
}

const askForSearchTerm = async (): Promise<string> => {
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

const printSearchResults = (items: unknown[]) => {
  if (!items.length) {
    console.log("No results found")
    return
  }
  console.log("--")
  items.forEach((item) => {
    Object.entries(item).forEach(([key, value]) => {
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        console.log(`${key}: ${value}`)
      } else {
        console.log(`${key}: ${JSON.stringify(value)}`)
      }
    })
    console.log("--")
  })
  console.log(`Number of results: ${items.length}`)
}

const run = async (databaseDirectory) => {
  console.log("Welcome to the search engine coding challenge!")
  console.log("Press escape at anytime to quit")

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
