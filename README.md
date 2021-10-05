# vUtils

Utility for vue 3.

## Installation

### CDN

this package published as `vUtils` module in umd.

```html
<script src="https://unpkg.com/@bardoui/vutils"></script>
```

### NPM

```bash
npm i @bardoui/vutils
```

## Helpers

### isEmptySlot

check if slot not passed or empty.

```ts
import { isEmptySlot } from "@bardoui/vutils";
isEmptySlot($slots.header);
```

## Composition Apis

### Timer

create a reactive timer from milliseconds.

```ts
import { ref } from "vue";
import { useTimer } from "@bardoui/vutils";
const amount = ref(60000);
const { startTimer, stopTimer, timer, timerAlive } = useTimer();

function start() {
  startTimer(amount.value);
}
function stop() {
  stopTimer();
}
```

### Shortcut

Register keyboard shortcut handler in component. you must enter KeyboardEvent.Key as key.

```ts
import { useShortcut } from "@bardoui/vutils";
const { addShortcut } = useShortcut();
addShortcut({
  key: "Enter",
  callback: callbackA,
  prevent: true,
  stop: true
});
addShortcut({
  key: ["Escape", "-"],
  callback: callbackB,
  prevent: true,
  stop: true
});
```

### Lister

Help to parse and generate list related requests (paginate, filters, etc.).

**Note** you must watch `query` to detect value changes.

```ts
import { watchEffect } from "vue";
import { useLister } from "@/useLister";

const {
  page,
  limit,
  query,
  search,
  apply,
  hash,
  setFilter,
  toggleFilter,
  filterValue,
  filterContains
} = useLister({ triggers: ["page", "limit"] }); // just auto update on page and limit changes

const username = filterValue<string>("name");
const types = filterValue<string>("type");
const hasAdminFilter = filterContains("type", "admin");
// You must watch query for detect changing
watchEffect(() => (result.value = JSON.stringify(query.value, null, 4)));
```

Lister return value:

| Value          | Type                                            | Description                                                    |
| :------------- | :---------------------------------------------- | :------------------------------------------------------------- |
| query          | `Computed<Object>`                              | query object                                                   |
| hash           | `Computed<string>`                              | encoded string of query (useful for url)                       |
| isEmpty        | `Computed<boolean>`                             | true if any records exists                                     |
| records        | `Array`                                         | records array                                                  |
| total          | `number`                                        | response total meta                                            |
| from           | `number`                                        | response from meta                                             |
| to             | `number`                                        | response to meta                                               |
| pages          | `number`                                        | response pages meta (total page count)                         |
| page           | `ref<number>`                                   | reactive object of current page                                |
| limit          | `ref<number>`                                   | reactive object of current limit                               |
| sort           | `ref<string>`                                   | reactive object of current sort                                |
| order          | `ref<"asc"|"desc>`                              | reactive object of current sort order                          |
| search         | `ref<string>`                                   | reactive object of current search                              |
| limits         | `ref<string[]>`                                 | reactive object of valid limits                                |
| sorts          | `ref<string[]>`                                 | reactive object of valid sorts                                 |
| resetPage      | `() => void`                                    | discard page change before apply                               |
| resetLimit     | `() => void`                                    | discard limit change before apply                              |
| resetSort      | `() => void`                                    | discard sort change before apply                               |
| resetOrder     | `() => void`                                    | discard order change before apply                              |
| clearSearch    | `() => void`                                    | clear search value                                             |
| resetSearch    | `() => void`                                    | discard search change before apply                             |
| resetFilters   | `() => void`                                    | discard filters change before apply                            |
| clearFilters   | `() => void`                                    | discard filters                                                |
| removeFilter   | `(key: string) => void`                         | remove filter                                                  |
| removeFilter   | `(key: string) => void`                         | remove filter                                                  |
| setFilter      | `(key: string, value: any)`                     | set to null or undefined will remove filter                    |
| toggleFilter   | `(key: string, value: any)`                     | toggle value from arrayed filter                               |
| filterValue    | `<T = any>(k: string): ComputedRef<T>`          | generate a computed value for filter key                       |
| filterContains | `(k: string, value: any): ComputedRef<boolean>` | generate a computed value for arrayed filter contains key      |
| reset          | `() => void`                                    | discard all changes                                            |
| apply          | `() => void`                                    | apply all changes                                              |
| parseJson      | `(data: any) => void`                           | parse response from json                                       |
| parseHash      | `(data: string) => void`                        | parse response from encoded string (useful for parse from url) |
