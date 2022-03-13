<template>
    <section>
        <h1>Lister</h1>
        <div>
            <button @click="parseFromHash">Parse from hash</button>
            <button @click="parseFromJson">Parse from json</button>
            <button @click="apply()">Apply</button>
            <button @click="page = page + 1">Add Page</button>
            <button @click="limit = limit + 1">Add Limit</button>
            <button @click="sort = 'name'">Sort Name</button>
            <button @click="sort = 'family'">Sort Family</button>
            <button @click="search = 'search me'">Set Search</button>
            <button @click="clearSearch">Clear Search</button>
            <button @click="username = 'John Doe'">
                Set User Name
            </button>
            <button @click="username = null">Clear User Name</button>
            <button @click="toggleFilterArr('groups', 'admin')">
                Admin users
            </button>
            <button @click="toggleFilterArr('groups', 'operator')">
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
    sort,
    order,
    limit,
    apply,
    toggleFilterArr,
    hash,
    search,
    clearSearch,
    parseHash,
    parseJson,
    filter,
    filterValue,
    filterExists,
    onApply,
    clearFilters,
    response,
    params
} = useLister(
    { triggers: "all", stores: ["limit", "sort", "order"], sort: "com" },
    "hi"
);

const username = filter<string>("name");
const groups = filterValue<string[]>("groups");
const hasAdmin = filterExists("groups", "admin");
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
