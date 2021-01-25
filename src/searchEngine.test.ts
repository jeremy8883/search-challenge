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
    const iterator = searchList(itemsWithStringValues, "country", "Australia")
    const result = iterator.next()
    expect(result.value).toEqual([
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
    const iterator = searchList(itemsWithStringValues, "name", "Australia")
    const result = iterator.next()
    expect(result.value).toEqual([])
  })

  it("returns results for numeric values", () => {
    const iterator = searchList(itemsWithNumericValues, "age", "20")
    const result = iterator.next()
    expect(result.value).toEqual([
      {
        name: "Jane",
        age: 20,
      },
    ])
  })

  it("does not return results for partial numeric matches", () => {
    // ie. "2" is part of "20", but returning that search result would be unexpected
    const iterator = searchList(itemsWithNumericValues, "age", "2")
    const result = iterator.next()
    expect(result.value).toEqual([])
  })

  it("returns results for boolean values", () => {
    const iterator = searchList(itemsWithBooleanValues, "isRegistered", "True")
    const result = iterator.next()
    expect(result.value).toEqual([
      {
        name: "Jane",
        isRegistered: true,
      },
    ])
  })

  it("returns results for boolean values", () => {
    const iterator = searchList(itemsWithBooleanValues, "isRegistered", "False")
    const result = iterator.next()
    expect(result.value).toEqual([
      {
        name: "John",
        isRegistered: false,
      },
    ])
  })

  it("ignores any invalid input", () => {
    // We should probably show something to the user saying that the boolean value is invalid,
    // but for this coding challenge, I think it's ok
    const iterator = searchList(
      itemsWithBooleanValues,
      "isRegistered",
      "gibberish"
    )
    const result = iterator.next()
    expect(result.value).toEqual([])
  })

  it("returns empty fields, if the supplied search term is empty", () => {
    const iterator = searchList(
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
    const result = iterator.next()
    expect(result.value).toEqual([
      {
        name: "Jane",
        country: "",
      },
    ])
  })

  it("searches through array values", () => {
    const iterator = searchList(
      [
        { tags: ["foo", "bar"] },
        { tags: ["hello", "world"] },
        { tags: ["fiz", "baz"] },
      ],
      "tags",
      "world"
    )
    const result = iterator.next()
    expect(result.value).toEqual([{ tags: ["hello", "world"] }])
  })

  // This is an arbitrary rule, given that I was unsure of the requirements for this
  // challenge.
  it("searches all values on a nested object", () => {
    const iterator = searchList(
      [
        { manager: { name: "John" } },
        { manager: { name: "Jane" } },
        { manager: { name: "Julie" } },
      ],
      "manager",
      "Jane"
    )
    const result = iterator.next()
    expect(result.value).toEqual([{ manager: { name: "Jane" } }])
  })

  it("can return multiple pages", () => {
    const iterator = searchList(
      [
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
        { id: 3, name: "Julie" },
        { id: 4, name: "Julie" },
        { id: 5, name: "Jason" },
        { id: 6, name: "Julie" },
      ],
      "name",
      "Julie",
      2
    )
    let result = iterator.next()
    expect(result.value).toEqual([
      { id: 3, name: "Julie" },
      { id: 4, name: "Julie" },
    ])

    result = iterator.next()
    expect(result.value).toEqual([{ id: 6, name: "Julie" }])
  })

  it("is case insensitive", () => {
    const iterator = searchList(
      [{ name: "John" }, { name: "Jane" }],
      "name",
      "JOHN"
    )
    const result = iterator.next()
    expect(result.value).toEqual([{ name: "John" }])
  })

  it("normalizes accented characters", () => {
    const iterator = searchList(
      [{ name: "François" }, { name: "Jane" }],
      "name",
      "Francois"
    )
    const result = iterator.next()
    expect(result.value).toEqual([{ name: "François" }])
  })

  it("searches for null values", () => {
    const iterator = searchList(
      [
        { id: 1, name: null },
        // The downside, is that this entry will not get returned. I'm OK with this for now.
        { id: 2, name: "<<NULL>>" },
      ],
      "name",
      "<<NULL>>"
    )
    const result = iterator.next()
    expect(result.value).toEqual([{ id: 1, name: null }])
  })

  it("throws an error if unexpected value types are found", () => {
    const iterator = searchList(
      [
        { name: "Jane" },
        { name: () => {} }, // Function values are not supported
      ],
      "name",
      "Jane"
    )

    expect(() => {
      iterator.next()
    }).toThrowError()
  })
})
