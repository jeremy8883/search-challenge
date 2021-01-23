import fs from "fs"
import util from "util"

export const readFile = util.promisify(fs.readFile)
export const readDirectory = util.promisify(fs.readdir)

export const readJsonFile = async (filename: string) => {
  const data = await readFile(filename, "utf-8")
  return JSON.parse(data)
}
