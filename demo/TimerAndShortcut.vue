<template>
    <section>
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

        <h3>Shortcut</h3>
        <p>Press Enter key to start timer.</p>
        <p>Press Escape or - key to stop timer.</p>
    </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useTimer } from "../src/vUtils";
import { useShortcut } from "@/useShortcut";
const amount = ref(60000);
const { startTimer, stopTimer, timer, timerAlive } = useTimer();
const { addShortcut } = useShortcut();
addShortcut({
    key: "Enter",
    callback: start,
    prevent: true,
    stop: true
});
addShortcut({
    key: ["Escape", "-"],
    callback: stop,
    prevent: true,
    stop: true
});
function start() {
    startTimer(amount.value);
}
function stop() {
    stopTimer();
}
</script>
