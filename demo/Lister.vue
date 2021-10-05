<template>
    <section>
        <h1>Lister</h1>
        <div>
            <button @click="parseFromHash">Parse</button>
            <button @click="apply">Apply</button>
            <button @click="page = page + 1">Add Page</button>
            <button @click="limit = limit + 1">Add Limit</button>
            <button @click="search = 'search me'">Set Search</button>
            <button @click="setFilter('name', 'John Doe')">
                Set User Name
            </button>
            <button @click="setFilter('name', null)">Clear User Name</button>
            <button @click="toggleFilter('type', 'admin')">
                Toggle admin type
            </button>
            <button @click="toggleFilter('type', 'operator')">
                Toggle operator type
            </button>
        </div>
        <pre>{{ result }}</pre>
        <p>{{ hash }}</p>
        <p>Current types: {{ types }}</p>
        <p>User name is: {{ username }}</p>
        <p>types contains admin: {{ hasAdminFilter }}</p>
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
    setFilter,
    toggleFilter,
    query,
    hash,
    search,
    parseHash,
    filterValue,
    filterContains
} = useLister({ triggers: ["page"] });

const username = filterValue<string>("name");
const types = filterValue<string>("type");
const hasAdminFilter = filterContains("type", "admin");

function parseFromHash() {
    parseHash(
        "eyJwYWdlIjoxLCJsaW1pdCI6MjUsInNvcnQiOiJfaWQiLCJvcmRlciI6ImFzYyIsInNlYXJjaCI6IiIsImZpbHRlcnMiOnt9fQ=="
    );
}
watchEffect(() => (result.value = JSON.stringify(query.value, null, 4)));
</script>
