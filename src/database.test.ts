import { getDataFileNames, loadDatabase } from "./database"

const createReadDirectoryStub = (fileNames: string[]) => {
  return () => Promise.resolve(fileNames)
}

const createReadFileStub = (fileContents: string) => {
  return () => Promise.resolve(fileContents)
}

describe("getDataFileNames", () => {
  it("returns a list of files in a directory, with the json files filtered out", async () => {
    const files = ["foo.json", "bar.json", "hello.txt"]
    const result = await getDataFileNames(
      "./database",
      createReadDirectoryStub(files)
    )
    expect(result).toEqual(["foo.json", "bar.json"])
  })
})

describe("loadDatabase", () => {
  it("loads a JSON file from storage", async () => {
    const readFileStub = createReadFileStub('[{"foo":"bar"},{"foo":"hello"}]')
    const result = await loadDatabase("./database/foo.json", readFileStub)
    expect(result).toEqual([{ foo: "bar" }, { foo: "hello" }])
  })

  it("throws an error if the json data is not an array", () => {
    const readFileStub = createReadFileStub('{"foo":"bar"}')
    expect(
      loadDatabase("./database/foo.json", readFileStub)
    ).rejects.toThrowError()
  })

  it("throws an error if the values in the array are not all objects", () => {
    const readFileStub = createReadFileStub('[{"foo":"bar"},"foo"}]')
    expect(
      loadDatabase("./database/foo.json", readFileStub)
    ).rejects.toThrowError()
  })
})
