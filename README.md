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

## Usage

### Timer

create a reactive timer from milliseconds.

```ts
// Signature:
useTimer(ms: number)

/// Example
const { timer, onComplete } = useTimer(120000);
onComplete(() => (console.log("timer completed!")));
```
