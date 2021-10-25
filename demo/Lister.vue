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
        <pre>{{ result }}</pre>
        <p>{{ hash }}</p>
        <p>Username: {{ username }}</p>
        <p>Groups: {{ groups }}</p>
        <p>Contains admin users: {{ hasAdmin }}</p>
    </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";
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
    parseJson,
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
function parseFromJson() {
    parseJson({
        data: [{ _id: 1 }]
    });
}
onApply((q, h) => {
    result.value = JSON.stringify(q, null, 4);
    parseFromJson();
    console.log(q);
    // console.log(h);
});
</script>
