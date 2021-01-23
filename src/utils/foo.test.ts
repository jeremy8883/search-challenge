import { foo } from "./foo"

describe("foo", () => {
  it("returns bar", () => {
    const result = foo()
    expect(result).toEqual("bar")
  })
})
