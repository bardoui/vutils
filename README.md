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

```ts
import {onMounted} from "vue;
import { useLister } from "@bardoui/vutils";
const { toggleArray, onApply, filter, value, exists, parseHash } = useLister(options);
const username = filter<string>("username");
const groups = value<string[]>("groups");
const containsAdminGroup = exists("groups", "admin");

function toggleGroup(group: string) {
  toggleArray("groups", group);
}

onApply((query, hash) => {
  makeCrudRequest(query); // get data from server
  setQueryString(hash); // update url
});

onMounted(() => parseHash(queryString)); // parse current data from url
```

#### Constructor Options

All options are optional and lister use default value if option not passed or invalid value passed.

| Option      | Type                  | Default                              | Description                                                |
| :---------- | :-------------------- | :----------------------------------- | :--------------------------------------------------------- |
| triggers    | `Trigger[] | "all";`  | `["page", "limit", "sort", "order"]` | trigger auto apply on field change                         |
| page        | `number`              | `1`                                  | init page                                                  |
| limit       | `number`              | `25`                                 | init limit                                                 |
| validLimits | `number[]`            | `[]`                                 | valid limit list. if empty array passed all value allowed! |
| sort        | `string`              | `_id`                                | init sort                                                  |
| validSorts  | `string[]`            | `[]`                                 | valid sort list. if empty array passed all value allowed!  |
| order       | `"asc" | "desc"`      | `asc`                                | init order                                                 |
| search      | `string`              | `""`                                 | init search phrase                                         |
| filters     | `Record<string, any>` | `{}`                                 | init filters list                                          |

**Trigger** can be `"page" | "limit" | "sort" | "order" | "search" | "filters"`.

**Note:** if field not listed in trigger list, you must apply field changes manually!

**Note:** you can apply staged change using `apply()` method. Apply method apply all staged changes by default but you can list items must applied (e.g. `apply(["page", "order"])`).

**Note:** `reset()` method follow `apply()` pattern.

#### Usage

| Method/Attribute | Type                                             | Description                                           |
| :--------------- | :----------------------------------------------- | :---------------------------------------------------- |
| apply            | `(item: Trigger[] | "all") => void`              | apply staged changes                                  |
| onApply          | `(query: Object, hash: string) => void`          | register a callback to call after apply               |
| reset            | `(item: Trigger[] | "all") => void`              | discard staged (un-applied) changes                   |
| parseJson        | `(data: any) => void`                            | parse json response                                   |
| parseHash        | `(data: string) => void`                         | parse hash                                            |
| query            | `ComputedRef<Object>`                            | list of all request and response data                 |
| hash             | `ComputedRef<string>`                            | encoded _query_ string (can use as url query)         |
| records          | `ComputedRef<Array>`                             | response records                                      |
| isEmpty          | `ComputedRef<boolean>`                           | check if response has any _records_                   |
| total            | `ComputedRef<number>`                            | response total records                                |
| from             | `ComputedRef<number>`                            | response from records                                 |
| to               | `ComputedRef<number>`                            | response to records                                   |
| pages            | `ComputedRef<number>`                            | total pages count                                     |
| page             | `Ref<number>`                                    | page                                                  |
| limit            | `Ref<number>`                                    | limit                                                 |
| limits           | `Ref<number[]>`                                  | valid limits list                                     |
| sort             | `Ref<string>`                                    | sort                                                  |
| sorts            | `Ref<string[]>`                                  | valid sorts list                                      |
| order            | `Ref<"asc"|"desc">`                              | order                                                 |
| search           | `Ref<string>`                                    | search                                                |
| remove           | `(k: string) => void`                            | remove filter                                         |
| toggle           | `(k: string, v: any) => void`                    | set filter or remove filter if `undefined` value      |
| toggleArray      | `(k: string, v: any) => void`                    | toggle array filter item                              |
| filter           | `<T = any>(k: string) => WritableComputedRef<T>` | get a `Ref<T>` for filter                             |
| value            | `<T = any>(k: string) => ComputedRef<T>`         | create a `ComputedRef<T>` for filter                  |
| exists           | `(k: string, v: any) => ComputedRef<...>`        | create a `ComputedRef<boolean>` for array filter item |
| clearFilters     | `() => void`                                     | remove all filters                                    |
