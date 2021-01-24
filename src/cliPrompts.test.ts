import stripAnsi from "strip-ansi"
import { printSearchResults } from "./cliPrompts"
import chalk from "chalk"

// This "logStub" is used to replace the typical `console.log`. It
// will log each time it gets called. Then it will return those logs
// as a single, concatenated string when you call `getLog`.
const createLogMock = () => {
  let consoleLogs = []
  const logStub = (value) => {
    consoleLogs.push(value)
  }

  return {
    logStub,
    getLogs: (preserveColors?: boolean) => {
      // To keep these tests simple, we'll remove all colour escape
      // characters from the output
      return preserveColors
        ? consoleLogs.join("\n")
        : stripAnsi(consoleLogs.join("\n"))
    },
  }
}

describe("printSearchResults", () => {
  it("prints out a list of search results", () => {
    const { logStub, getLogs } = createLogMock()
    printSearchResults(
      [
        {
          name: "John Smith",
          age: 23,
          isEnrolled: true,
        },
        {
          name: "Jane Smith",
          age: 45,
          isEnrolled: false,
        },
      ],
      "name",
      5,
      logStub
    )
    expect(getLogs()).toEqual(
      `--
name: John Smith
age: 23
isEnrolled: true
--
name: Jane Smith
age: 45
isEnrolled: false
--
Number of results: 2 out of 5`
    )
  })

  it("converts any array or object value to json", () => {
    const { logStub, getLogs } = createLogMock()
    printSearchResults(
      [
        {
          name: "John Smith",
          tags: ["foo", "bar"],
          fizz: { hello: "world" },
        },
      ],
      "name",
      5,
      logStub
    )
    expect(getLogs()).toEqual(
      `--
name: John Smith
tags: ["foo","bar"]
fizz: {"hello":"world"}
--
Number of results: 1 out of 5`
    )
  })

  it("shows a message for when no results are found", () => {
    const { logStub, getLogs } = createLogMock()
    printSearchResults([], "name", 5, logStub)
    expect(getLogs()).toEqual(`No results found out of 5`)
  })

  it("bolds any null values", () => {
    const { logStub, getLogs } = createLogMock()
    printSearchResults(
      [
        {
          name: "John Smith",
          manager: null,
        },
      ],
      "name",
      5,
      logStub
    )
    expect(getLogs(true)).toContain(chalk.bold("<< null >>"))
  })
})
