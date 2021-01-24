import { Spinner } from "cli-spinner"

export const showLoader = () => {
  const spinner = new Spinner("Processing.. %s")
  spinner.setSpinnerString("|/-\\")
  spinner.start()

  return () => {
    spinner.stop(true)
  }
}
