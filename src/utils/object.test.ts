import { getAllItemKeys } from "./object"

describe("getAllItemKeys", () => {
  it("returns every object key found in the array items", () => {
    const result = getAllItemKeys([
      {
        foo: "bar",
        hello: "world",
      },
      {
        yes: "no",
      },
    ])
    expect(result).toEqual(["foo", "hello", "yes"])
  })

  it("does not work for the keys of nested values", () => {
    // There's nothing that says that we shouldn't allow support for this, but
    // for the scope of this challenge, I think this is fine.
    const result = getAllItemKeys([
      {
        foo: "bar",
        nested: {
          yes: "no",
        },
      },
    ])
    expect(result).toEqual(["foo", "nested"])
  })
})
