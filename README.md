# Zendesk search coding challenge

## Quick start

Ensure that you have [node v14 or higher installed](https://nodejs.org/en/download/), then run:

```
npm install
npm run start
``` 

To run the tests:

```
npm run test
```

or to run the watcher:

```
npm run test:watch
```

# Assumptions

* I didn't see `null` values in the data files (although I did see them hidden in some of the description strings), but I figured that this would need to be accounted for. To search for a null value, enter "<<NULL>>" as the search term. The downside with this approach is that if you actually wanted to search for that same string value, you can't. I didn't think it was worth it to revamp the UI for this very rare scenario.

* The requirements mention:

> The user should be able to search on any field, full value matching is fine (e.g. “mar” won’t return “mary”).

Does this mean that both the object key, and the object value accept full text matching, or was that only referring to the object key? I've assumed the former. And what about multiple words? Would a search for "mary" return the result "mary anne"? I've assumed not.

For my solution, I have at least done some normalization, so the search terms are case-insensitive, and it will account for accented characters.

* The requirements also say:

> Performance - should gracefully handle a significant increase in amount of data provided (e.g 10000+ users).

The script actually loads the entire JSON object into memory up front. It also scans the entire file before prompting for the field name (as so it can supply the results for the autocomplete). Despite all of that, I've tested with ~35K user entries, and there is no noticeable lag on my personal laptop.

To satisfy this requirement, I've interpreted this to mean that the UX will act gracefully. So I've added a loading animation for the potentially long processes.

I've also paginated the search results. This is so we don't potentially blast 35K results to the user. It also means that we don't scan the entire data array if we don't need to, so there's a small performance win there.

An alternative option would be to scan the JSON file in buffered increments, and remove the field name autocompletion (or we could make the assumption that key values are the same for every entry, and only scan the keys at index 0). I thought that given we can get pretty far with loading a JSON file entirely into memory, that going this way would go against the simplicity requirement.

Something to note, the loading spinner will actually freeze if the synchronous processes take long enough. To solve this issue, I'd need to convert the `getAllItemKeys` and `showSearchResults` functions into web workers. I assumed that this would be going outside of scope.

* Most of the application is unit tested. The main exception being the root index.ts file. This code would be better tested with a full e2e testing solution, which I have not implemented.
