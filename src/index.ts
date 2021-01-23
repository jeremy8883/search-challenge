import { readDirectory, readJsonFile } from "./utils/file"
import prompts from "prompts"
import * as path from "path"
import { searchList } from "./searchEngine"
import { getAllItemKeys } from "./utils/object"

const askForDataFile = async (files: string[]): Promise<string> => {
  const { dataFileName } = await prompts({
    type: "select",
    name: "dataFileName",
    message: "Select datafile",
    choices: files.map((f) => ({ title: f, value: f })),
  })
  return dataFileName
}

const askForFieldName = async (fieldNames: string[]): Promise<string> => {
  const { fieldName } = await prompts({
    type: "autocomplete",
    name: "fieldName",
    message: "Enter field name",
    choices: fieldNames.map((fn) => ({ title: fn, value: fn })),
  })
  return fieldName
}

const askForSearchTerm = async (): Promise<string> => {
  const { searchTerm } = await prompts({
    type: "text",
    name: "searchTerm",
    message: "Enter search term",
  })
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
      console.log(`${key}: ${value}`)
    })
    console.log("--")
  })
  console.log(`Number of results: ${items.length}`)
}

const run = async (databaseDirectory) => {
  console.log("Welcome to the search coding challenge!")

  const files = await readDirectory(databaseDirectory)
  const dataFileName = await askForDataFile(files)

  const items = await readJsonFile(path.join(databaseDirectory, dataFileName))
  const allPossibleKeys = getAllItemKeys(items)
  const fieldName = await askForFieldName(allPossibleKeys)

  const searchTerm = await askForSearchTerm()

  const results = searchList(items, fieldName, searchTerm)
  printSearchResults(results)
}

run("./database")
