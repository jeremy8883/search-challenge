# Search coding challenge

## Quick start

Ensure that you have [node v14 or higher installed](https://nodejs.org/en/download/), then run:

```
npm install
npm run start
``` 

Follow the prompts to search the data files, found under the [`database`](./database) directory.

![](./docs/images/screenshot.png)

## Testing

To run the tests:

```
npm run test
```

or to run the watcher:

```
npm run test:watch
```

# About the solution

## Search string matching

As per the requirements, the script only supports full value matching. But I have at least done some normalization, so the search terms are case-insensitive, and it will account for accented characters.

I didn't see `null` values in the data files (although I did see them hidden in some of the description strings), but I figured that this would need to be accounted for, since they are a valid value in JSON. To search for a null value, enter `<<NULL>>` as the search term. The downside with this approach is that if you actually wanted to search for that same string value, you can't. I didn't think it was worth it to revamp the UI for this coding challenge, but for any real production app, I would.

You can also search for `<<UNDEFINED>>` to search for missing object keys.

I also didn't see any nested objects in the sample data. I handle these anyway, by simply doing a search on every value of a nested object.

To search for an empty value, simply press enter when asked for the search term. 

## Performance and Scalability

The script actually loads the entire JSON object into memory up front. It also scans the entire file before prompting for the field name, as so it can supply the results for the field name autocomplete.

In the challenge requirements, it uses 10,000+ users as an example to test. I've tested the solution with 877,500 users, which was a 470MB file. It takes ~4580ms for the file to read into memory, and for it to scan all of the possible object keys. Then it only took ~360ms to actually do the search.

For larger files however, I get an error, `Cannot create a string longer than 0x1fffffe8 characters`. To fix this, I would need to update the script to scan the JSON file in buffered increments, and maybe remove the field name autocompletion for files larger than 50MB. I might be able to use [stream-json](https://www.npmjs.com/package/stream-json) for this.

To ensure that that the UX will act gracefully. I've added a loading animation for any potentially long process. Although, the loading spinner will actually freeze if the synchronous processes take long enough. To solve this issue, I'd need to convert the `getAllItemKeys` and `showSearchResults` functions into web workers. I assumed that this would be going outside of scope.

I've also paginated the search results. This is so we don't potentially blast thousands of results to the user. It also means that we don't scan the entire data array if we don't need to, making it a prerequisite, if we ever wanted to scan the json file via a stream.

## Testing

Most of the application is unit tested.

The main exception being the root index.ts file. If I were to test it, it would be with integration tests. Because they are expensive to maintain and implement, I would probably only test for the single happy path, just to make sure all the pieces of code connect together.

I've never done integration testing for a CLI before, but it looks like this [cli-prompts-test](https://www.npmjs.com/package/cli-prompts-test) library could help. I'd use that to mock the `prompts` library that I use. Then, I would need to mock `console.log`, as well as some of the node filesystem functions, such as `readFile` and `readDirectory`. I could do this either via `jest.mock`, or by passing these dependencies as params into the main function.

Let me know if you'd still like to see them in, and I'll implement.
