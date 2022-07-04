<template>
    <TimerAndShortcut />
    <Lister />
    <EventHub />
</template>

<script lang="ts" setup>
import TimerAndShortcut from "./TimerAndShortcut.vue";
import Lister from "./Lister.vue";
import EventHub from "./EventHub.vue";
</script>

<style>
body {
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 2rem;
    font-family: Calibri;
    font-size: 13px;
    color: #03071e;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
#app {
    display: block;
    width: 100%;
    padding: 1em;
    box-sizing: border-box;
}

section {
    padding: 1rem;
}

h1,
h3 {
    margin: 0;
    margin-bottom: 1rem;
    font-weight: 100;
    font-size: 2rem !important;
    color: #a4133c;
}

input[type="text"] {
    display: block;
    width: 20rem;
    max-width: 100%;
    margin: 0.2rem 0;
    padding: 0.5em 1em;
    border: 1px solid #6c757d;
    font: inherit;
}

pre {
    padding: 1rem;
    background: #e9ecef;
}

input[type="text"]:focus {
    outline: none;
    border-color: #a4133c;
}

*:not(:last-child):not(div):not(pre) {
    margin-right: 5px;
    font: inherit;
}
</style>
