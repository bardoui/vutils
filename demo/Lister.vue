<template>
    <section>
        <h1>Lister</h1>
        <div>
            <button @click="parseFromHash">Parse from hash</button>
            <button @click="apply">Apply</button>
            <button @click="page = page + 1">Add Page</button>
            <button @click="limit = limit + 1">Add Limit</button>
            <button @click="search = 'search me'">Set Search</button>
            <button @click="username = 'John Doe'">
                Set User Name
            </button>
            <button @click="username = null">Clear User Name</button>
            <button @click="toggleArray('groups', 'admin')">
                Admin users
            </button>
            <button @click="toggleArray('groups', 'operator')">
                Operator users
            </button>
            <button @click="clearFilters">
                Clear filters
            </button>
        </div>
        <pre>{{ result }}</pre>
        <p>{{ hash }}</p>
        <p>Username: {{ username }}</p>
        <p>Groups: {{ groups }}</p>
        <p>Contains admin users: {{ hasAdmin }}</p>
    </section>
</template>

<script lang="ts" setup>
import { watchEffect, ref } from "vue";
import { useLister } from "@/useLister";

const result = ref("{}");
const {
    page,
    limit,
    apply,
    toggleArray,
    hash,
    search,
    parseHash,
    filter,
    value,
    exists,
    onApply,
    clearFilters
} = useLister({ triggers: "all" });

const username = filter<string>("name");
const groups = value<string[]>("groups");
const hasAdmin = exists("groups", "admin");
function parseFromHash() {
    parseHash(
        "eyJwYWdlIjoxLCJsaW1pdCI6MjUsInNvcnQiOiJfaWQiLCJvcmRlciI6ImFzYyIsInNlYXJjaCI6IiIsImZpbHRlcnMiOnt9fQ=="
    );
}
onApply((q, h) => {
    result.value = JSON.stringify(q, null, 4);
    console.log(h);
});
</script>
