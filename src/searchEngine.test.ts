import { searchList } from "./searchEngine"

describe("searchList", () => {
  const itemsWithStringValues = [
    {
      name: "Fred",
      country: "Australia",
    },
    {
      name: "Jane",
      country: "Papua New Guinea",
    },
    {
      name: "John Paul",
      country: "Australia",
    },
  ]

  const itemsWithNumericValues = [
    { name: "Jane", age: 20 },
    { name: "John", age: 25 },
  ]

  const itemsWithBooleanValues = [
    { name: "Jane", isRegistered: true },
    { name: "John", isRegistered: false },
  ]

  it("searches the list of results", () => {
    const result = searchList(itemsWithStringValues, "country", "Australia")
    expect(result).toEqual([
      {
        name: "Fred",
        country: "Australia",
      },
      {
        name: "John Paul",
        country: "Australia",
      },
    ])
  })

  it("does not return results for the different fields", () => {
    // ie. there ar no entries with the "name" "Australia", it is a "country".
    const result = searchList(itemsWithStringValues, "name", "Australia")
    expect(result).toEqual([])
  })

  it("does a partial search of the field", () => {
    const result = searchList(itemsWithStringValues, "country", "New")
    expect(result).toEqual([
      {
        name: "Jane",
        country: "Papua New Guinea",
      },
    ])
  })

  it("returns results for numeric values", () => {
    const result = searchList(itemsWithNumericValues, "age", "20")
    expect(result).toEqual([
      {
        name: "Jane",
        age: 20,
      },
    ])
  })

  it("does not return results for partial numeric matches", () => {
    // ie. "2" is part of "20", but returning that search result would be unexpected
    const result = searchList(itemsWithNumericValues, "age", "2")
    expect(result).toEqual([])
  })

  it("returns results for boolean values", () => {
    const result = searchList(itemsWithBooleanValues, "isRegistered", "True")
    expect(result).toEqual([
      {
        name: "Jane",
        isRegistered: true,
      },
    ])
  })

  it("returns results for boolean values", () => {
    const result = searchList(itemsWithBooleanValues, "isRegistered", "False")
    expect(result).toEqual([
      {
        name: "John",
        isRegistered: false,
      },
    ])
  })

  it("ignores any invalid input", () => {
    // We should probably show something to the user saying that the boolean value is invalid,
    // but for this coding challenge, I think it's ok
    const result = searchList(
      itemsWithBooleanValues,
      "isRegistered",
      "gibberish"
    )
    expect(result).toEqual([])
  })

  it("returns empty fields, if the supplied search term is empty", () => {
    const result = searchList(
      [
        {
          name: "Fred",
          country: "Australia",
        },
        {
          name: "Jane",
          country: "",
        },
      ],
      "country",
      ""
    )
    expect(result).toEqual([
      {
        name: "Jane",
        country: "",
      },
    ])
  })
})
