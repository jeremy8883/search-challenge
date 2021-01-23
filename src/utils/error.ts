import { ErrorCode } from "../constants/errorCode"

export const newError = (
  message: string,
  code: ErrorCode
): Error & { code: ErrorCode } => {
  return Object.assign(new Error(message), { code })
}
