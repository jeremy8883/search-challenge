import fs from "fs"
import util from "util"

export const readFile = util.promisify(fs.readFile)
export const readDirectory = util.promisify(fs.readdir)
