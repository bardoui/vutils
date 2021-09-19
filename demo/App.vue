<template>
    <div class="section">
        <h1>Timer</h1>
        <div>
            <input type="number" v-model.number="amount" />
            <button v-if="timerAlive" @click.prevent="stop">Stop</button>
            <button v-else @click.prevent="start">Start</button>
        </div>
        <p>Remains: {{ timer }}</p>
        <p>
            Timer is <strong>{{ timerAlive ? "Alive" : "Completed" }}!</strong>
        </p>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useTimer } from "../src/vUtils";
const amount = ref(60000);
const { startTimer, stopTimer, timer, timerAlive } = useTimer();

function start() {
    startTimer(amount.value);
}
function stop() {
    stopTimer();
}
</script>

<style>
body {
    display: block;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 2rem;
    font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
        sans-serif;
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

.section {
    padding: 1rem;
}

h1 {
    font-size: 2rem;
    font-weight: normal;
    margin: 0;
    color: #42b883;
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

input[type="text"]:focus {
    outline: none;
    border-color: #42b883;
}

.desc {
    display: block;
    box-sizing: border-box;
    margin: 0;
    padding: 0.5rem 0;
    color: #6c757d;
}

.wrapper {
    background: #e9ecef;
    border-radius: 3px;
    border: 1px solid #e9ecef;
    padding: 1rem;
}

.wrapper.has-focus {
    border-color: #dc2f02;
}
</style>
