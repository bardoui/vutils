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

Help to parse and generate list related requests (paginate, filters, etc).

**Note:** you can pass unique key to store parameters (limit, sort, order) in localStorage.

```ts
import {onMounted} from "vue;
import { useLister } from "@bardoui/vutils";
const { toggleFilterArr, onApply, filter, filterValue, filterExists, parseHash } = useLister(options, "admin-users");
const username = filter<string>("username");
const groups = filterValue<string[]>("groups");
const containsAdminGroup = filterExists("groups", "admin");

function toggleGroup(group: string) {
  toggleFilterArr("groups", group);
}

onApply((params, hash) => {
  makeCrudRequest(params); // get data from server
  setQueryString(hash); // update url
});

onMounted(() => parseHash(queryString)); // parse current data from url
```

#### Constructor Options

All options are optional and lister use default value if option not passed or invalid value passed.

| Option   | Type                  | Default                              | Description                                                |
| :------- | :-------------------- | :----------------------------------- | :--------------------------------------------------------- |
| triggers | `Trigger[] | "all"`   | `["page", "limit", "sort", "order"]` | auto apply on field change                                 |
| stores   | `Store[]`             | `[]`                                 | stored items in local storage                              |
| limits   | `number[]`            | `[]`                                 | valid limit list. if empty array passed all value allowed! |
| sorts    | `string[]`            | `[]`                                 | valid sort list. if empty array passed all value allowed!  |
| page     | `number`              | `1`                                  | init page                                                  |
| limit    | `number`              | `25`                                 | init limit                                                 |
| sort     | `string`              | `_id`                                | init sort                                                  |
| order    | `"asc" | "desc"`      | `asc`                                | init order                                                 |
| search   | `string`              | `""`                                 | init search phrase                                         |
| filters  | `Record<string, any>` | `{}`                                 | init filters list                                          |

**Trigger** can be `"page" | "limit" | "sort" | "order" | "search" | "filters"`.

**Store** can be `"limit" | "sort" | "order"`.

**Note:** if field not listed in trigger list, you must apply field changes manually!

**Note:** you can apply staged change using `apply()` method. Apply method apply all staged changes by default but you can list items must applied as parameter (e.g. `apply(["page", "order"])`).

**Note:** `reset()` method follow `apply()` pattern.

#### Usage

| Method/Attribute | Type                                                   | Description                                                                                              |
| :--------------- | :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| page             | `ref<number>`                                          | reactive page field                                                                                      |
| limit            | `ref<number>`                                          | reactive limit field                                                                                     |
| sort             | `ref<string>`                                          | reactive sort field                                                                                      |
| order            | `ref<OrderType>`                                       | reactive order field. accept 'asc' and 'desc' only. this field automatically change on sort value change |
| search           | `ref<string>`                                          | reactive search field                                                                                    |
| clearSearch      | `() => void`                                           | clear search field and fire `apply(['search'])`                                                          |
| removeFilter     | `(key: string) => void`                                | remove filter                                                                                            |
| toggleFilter     | `(key: string, v: unknown) => void`                    | toggle filter item (remove item if `undefined` passed)                                                   |
| toggleFilterArr  | `(key: string, v: unknown) => void`                    | toggle array filter item                                                                                 |
| filter           | `<T = unknown>(key: string) => WritableComputedRef<T>` | reactive ref for filter item                                                                             |
| filterValue      | `<T = any>(k: string) => void`                         | get a computed ref for filter item                                                                       |
| filterExists     | `(k: string, v: any) => ComputedRef<boolean>`          | get a computed ref for filter item exists                                                                |
| clearFilters     | `() => void`                                           | clear filters and fire `apply(["filters"])`                                                              |
| apply            | `(items?: Trigger[] | "all") => void`                  | apply staged changes                                                                                     |
| reset            | `(items?: Trigger[] | "all") => void`                  | discard staged (un-applied) changes                                                                      |
| parseJson        | `(raw: any) => void`                                   | parse json response                                                                                      |
| parseHash        | `(hashed: string) => void`                             | parse parameters from Base64 encoded string                                                              |
| onApply          | `(callback: Callback) => Callback`                     | register a callback to call after request parameter changes                                              |
| params           | `ComputedRef<{page,limit,sort,order,search,filters}>`  | request parameters                                                                                       |
| response         | `ComputedRef<Object>`                                  | all response data                                                                                        |
| hash             | `ComputedRef<string>`                                  | Base64 encoded _params_ (can use as url query)                                                           |
| records          | `ComputedRef<any[]>`                                   | response `data` field as array                                                                           |
| isEmpty          | `ComputedRef<boolean>`                                 | check if response has no _records_                                                                       |
| total            | `ComputedRef<number>`                                  | response `total` field                                                                                   |
| from             | `ComputedRef<number>`                                  | response `from` field                                                                                    |
| to               | `ComputedRef<number>`                                  | response `to` field                                                                                      |
| pages            | `ComputedRef<number>`                                  | response `pages` field                                                                                   |
