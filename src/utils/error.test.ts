import { newError } from "./error"
import { ErrorCode } from "../constants/errorCode"

describe("newError", () => {
  it("creates a new error object, with the supplied error code", () => {
    const result = newError("Invalid first name", ErrorCode.ioError)
    expect(result.code).toEqual(ErrorCode.ioError)
    expect(result.message).toEqual("Invalid first name")
  })
})
