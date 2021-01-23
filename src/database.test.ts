import { loadDatabase } from "./database"

const createReadFileStub = (fileContents: string) => {
  return () => Promise.resolve(fileContents)
}

describe("loadDatabase", () => {
  it("loads a JSON file from storage", async () => {
    const readFileStub = createReadFileStub('[{"foo":"bar"},{"foo":"hello"}]')
    const result = await loadDatabase("./database/foo.json", readFileStub)
    expect(result).toEqual([{ foo: "bar" }, { foo: "hello" }])
  })

  it("throws an error if the json data is not an array", () => {
    const fileContents = '{"foo":"bar"}'
    const readFileMock = () => Promise.resolve(fileContents)
    expect(
      loadDatabase("./database/foo.json", readFileMock)
    ).rejects.toThrowError()
  })

  it("throws an error if the values in the array are not all objects", () => {
    const fileContents = '[{"foo":"bar"},"foo"}]'
    const readFileMock = () => Promise.resolve(fileContents)
    expect(
      loadDatabase("./database/foo.json", readFileMock)
    ).rejects.toThrowError()
  })
})
