<template>
    <section>
        <h1>Event Hub</h1>
        <div>
            <button @click.prevent="hub.pass('inc', 3)">Increment 3</button>
            <button @click.prevent="hub.pass('name', 'John')">send John</button>
            <button @click.prevent="hub.pass('greet', 'greeting')">
                send Unhandled
            </button>
        </div>
        <p>
            result: <strong>{{ data }}</strong>
        </p>
    </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useEvent } from "../src/useEvent";

const data = ref("");
const hub = useEvent({});
hub.onPass<number>("inc", v => (data.value = `${v + 1}`));
hub.onPass("name", v => (data.value = `name is: ${v}`));
hub.onSuccess((m,v) => (data.value = `${v} received from ${m} method!`));
hub.onError((m,err) => (data.value = `${err} error received from ${m} method!`));
</script>
