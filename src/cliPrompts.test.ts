import { printSearchResults } from "./cliPrompts"

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
    getLogs: () => consoleLogs.join("\n"),
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
Number of results: 2`
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
      logStub
    )
    expect(getLogs()).toEqual(
      `--
name: John Smith
tags: ["foo","bar"]
fizz: {"hello":"world"}
--
Number of results: 1`
    )
  })
})
