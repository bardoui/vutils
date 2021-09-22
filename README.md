# Directives

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

## Timer

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
