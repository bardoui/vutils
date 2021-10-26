<template>
    <section>
        <h1>Lister</h1>
        <div>
            <button @click="parseFromHash">Parse from hash</button>
            <button @click="parseFromJson">Parse from json</button>
            <button @click="apply()">Apply</button>
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
        <p>Username: {{ username }}</p>
        <p>Groups: {{ groups }}</p>
        <p>Contains admin users: {{ hasAdmin }}</p>
        <pre>{{ response }}</pre>
        <pre>{{ params }}</pre>
        <pre>{{ hash }}</pre>
    </section>
</template>

<script lang="ts" setup>
import { useLister } from "@/useLister";

const {
    page,
    limit,
    apply,
    toggleArray,
    hash,
    search,
    parseHash,
    parseJson,
    filter,
    valueOf,
    exists,
    onApply,
    clearFilters,
    response,
    params
} = useLister({ triggers: "all" });

const username = filter<string>("name");
const groups = valueOf<string[]>("groups");
const hasAdmin = exists("groups", "admin");
function parseFromHash() {
    parseHash(
        "eyJwYWdlIjoxLCJsaW1pdCI6MjUsInNvcnQiOiJfaWQiLCJvcmRlciI6ImFzYyIsInNlYXJjaCI6IiIsImZpbHRlcnMiOnt9fQ=="
    );
}
function parseFromJson() {
    parseJson({
        page: 100,
        data: [{ _id: 1 }]
    });
}
onApply((params, hash) => {
    console.log(params);
    console.log(hash);
});
</script>
