import stripAnsi from "strip-ansi"
import { showSearchResults } from "./cliPrompts"
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

const createIterator = (pages: object[][]) => {
  return (function* () {
    for (let i = 0; i < pages.length; i++) {
      if (i === pages.length - 1) {
        return pages[i]
      }
      yield pages[i]
    }
  })()
}

describe("showSearchResults", () => {
  it("prints out a list of search results", async () => {
    const { logStub, getLogs } = createLogMock()
    await showSearchResults(
      createIterator([
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
      ]),
      "name",
      5,
      logStub
    )
    expect(getLogs()).toEqual(
      `name: John Smith
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

  it("converts any array or object value to json", async () => {
    const { logStub, getLogs } = createLogMock()
    await showSearchResults(
      createIterator([
        [
          {
            name: "John Smith",
            tags: ["foo", "bar"],
            fizz: { hello: "world" },
          },
        ],
      ]),
      "name",
      5,
      logStub
    )
    expect(getLogs()).toEqual(
      `name: John Smith
tags: ["foo","bar"]
fizz: {"hello":"world"}
--
Number of results: 1 out of 5`
    )
  })

  it("shows a message for when no results are found", async () => {
    const { logStub, getLogs } = createLogMock()
    await showSearchResults(createIterator([[]]), "name", 5, logStub)
    expect(getLogs()).toEqual(`No results found out of 5`)
  })

  it("bolds any null values", async () => {
    const { logStub, getLogs } = createLogMock()
    await showSearchResults(
      createIterator([
        [
          {
            name: "John Smith",
            manager: null,
          },
        ],
      ]),
      "name",
      5,
      logStub
    )
    expect(getLogs(true)).toContain(chalk.bold("<< null >>"))
  })

  it("only displays one page at a time", async () => {
    const { logStub, getLogs } = createLogMock()
    // This stubs the function that awaits for the user to press any key to proceed.
    // For the tests, instead, we'll take note of the log so far, and check the result
    // later.
    const awaitForInputStub = () => {
      firstPage = getLogs()
      return Promise.resolve(undefined)
    }
    let firstPage = null
    await showSearchResults(
      createIterator([
        [{ name: "John Smith" }, { name: "Jane Smith" }],
        [{ name: "Jason Smith" }, { name: "Janet Smith" }],
      ]),
      "name",
      5,
      logStub,
      awaitForInputStub
    )
    expect(firstPage).toEqual(`name: John Smith
--
name: Jane Smith
--`)
    // This would be both page 1 and page 2, since all of the logs are appended together
    expect(getLogs()).toEqual(`name: John Smith
--
name: Jane Smith
--
name: Jason Smith
--
name: Janet Smith
--
Number of results: 4 out of 5`)
  })
})
