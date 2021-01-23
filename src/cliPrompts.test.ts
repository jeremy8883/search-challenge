import { printSearchResults } from "./cliPrompts"

// This "logSpy" is used to replace the typical `console.log`. It
// will log each time it gets called. Then it will return those logs
// as a single, concatenated string when you call `getLog`.
const createLogSpy = () => {
  let consoleLogs = []
  const logSpy = (value) => {
    consoleLogs.push(value)
  }

  return {
    logSpy,
    getLogs: () => consoleLogs.join("\n"),
  }
}

describe("printSearchResults", () => {
  it("prints out a list of search results", () => {
    const { logSpy, getLogs } = createLogSpy()
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
      logSpy
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
    const { logSpy, getLogs } = createLogSpy()
    printSearchResults(
      [
        {
          name: "John Smith",
          tags: ["foo", "bar"],
          fizz: { hello: "world" },
        },
      ],
      logSpy
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
