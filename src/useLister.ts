import { ref, computed, watch } from "vue";

type Trigger = "page" | "limit" | "sort" | "order" | "search" | "filters";

interface ListerOption {
    triggers?: Trigger[] | "all";
    page?: number;
    limit?: number;
    validLimits?: number[];
    sort?: string;
    validSorts?: string[];
    order?: "asc" | "desc";
    search?: string;
    filters?: Record<string, any>;
}

/**
 * manage list filters
 * @todo fix not repeating route change
 */
export function useLister(opt: ListerOption) {
    // init
    const option = useOptions(opt);

    // stats
    let autoApply = true;
    const _query = ref<Record<string, any>>({});
    const query = computed(() => _query.value);
    const hash = computed(() => encode(JSON.stringify(_query.value)));
    const isEmpty = computed(() => records.value.length == 0);
    const records = computed(() =>
        Array.isArray(_query.value["data"]) ? _query.value["data"] : []
    );
    const total = computed(() =>
        Number.isInteger(_query.value["total"]) ? _query.value["total"] : 0
    );
    const from = computed(() =>
        Number.isInteger(_query.value["from"]) ? _query.value["from"] : 0
    );
    const to = computed(() =>
        Number.isInteger(_query.value["to"]) ? _query.value["to"] : 0
    );
    const pages = computed(() =>
        Number.isInteger(_query.value["pages"]) ? _query.value["pages"] : 0
    );

    // composition apis
    const { encode, decode, isObject, isVal } = useUtils();
    const { page } = usePage(option.page);
    const { limit, limits } = useLimit(option.limit, option.limits);
    const { sort, sorts } = useSort(option.sort, option.sorts);
    const { order } = useOrder(option.order);
    const { search, clearSearch } = useSearch(option.search);
    const {
        filters,
        clearFilters,
        removeFilter,
        setFilter,
        toggleFilter,
        filterValue,
        filterContains
    } = useFilter(option.filters);

    // methods
    function resetPage() {
        page.value = Number.isInteger(_query.value["page"])
            ? _query.value["page"]
            : option.page;
    }
    function resetLimit() {
        limit.value = Number.isInteger(_query.value["limit"])
            ? _query.value["limit"]
            : option.limit;
    }
    function resetSort() {
        sort.value = isVal(_query.value["sort"])
            ? _query.value["sort"]
            : option.sort;
    }
    function resetOrder() {
        order.value = isVal(_query.value["order"])
            ? _query.value["order"]
            : option.order;
    }
    function resetSearch() {
        search.value = isVal(_query.value["search"])
            ? _query.value["search"]
            : option.search;
    }
    function resetFilters() {
        filters.value = Object.assign(
            {},
            isVal(_query.value["filters"])
                ? _query.value["filters"]
                : option.filters
        );
    }
    function reset() {
        autoApply = false;
        resetPage();
        resetLimit();
        resetSort();
        resetOrder();
        resetSearch();
        resetFilters();
        autoApply = true;
    }
    function apply() {
        _query.value["page"] = page.value;
        _query.value["limit"] = limit.value;
        _query.value["sort"] = sort.value;
        _query.value["order"] = order.value;
        _query.value["search"] = search.value;
        _query.value["filters"] = Object.assign({}, filters.value);
    }
    function parseJson(data: any) {
        autoApply = false;
        try {
            if (isObject(data)) {
                _query.value = data;
                Number.isInteger(data.page)
                    ? (page.value = data.page)
                    : (_query.value["page"] = page.value);
                Number.isInteger(data.limit)
                    ? (limit.value = data.limit)
                    : (_query.value["limit"] = limit.value);
                data.sort
                    ? (sort.value = data.sort)
                    : (_query.value["sort"] = sort.value);
                ["asc", "desc"].includes(data.order)
                    ? (order.value = data.order)
                    : (_query.value["order"] = order.value);
                data.search != undefined
                    ? (search.value = data.search)
                    : (_query.value["search"] = search.value);
                isObject(data.filters)
                    ? (filters.value = Object.assign({}, data.filters))
                    : (_query.value["filters"] = Object.assign(
                          {},
                          filters.value
                      ));
            }
        } catch {
            //
        }
        autoApply = true;
    }
    function parseHash(data: string) {
        try {
            const json = decode(data);
            const raw = JSON.parse(json);
            parseJson(raw);
        } catch {
            //
        }
    }

    // hooks
    parseJson({});

    // watchers
    const trigger = (key: Trigger, value: any) => {
        autoApply && option.mustTriggered(key) && (_query.value[key] = value);
    };
    watch(page, v => trigger("page", v));
    watch(limit, v => trigger("limit", v));
    watch(sort, v => trigger("sort", v));
    watch(order, v => trigger("order", v));
    watch(search, v => trigger("search", v));
    watch(filters, v => trigger("filters", v), { deep: true });

    // return
    return {
        // readonly
        query,
        hash,
        isEmpty,
        records,
        total,
        from,
        to,
        pages,
        // vars
        page,
        limit,
        sort,
        order,
        search,
        limits,
        sorts,
        resetPage,
        resetLimit,
        resetSort,
        resetOrder,
        resetSearch,
        resetFilters,
        reset,
        apply,
        parseJson,
        parseHash,
        clearSearch,
        clearFilters,
        removeFilter,
        setFilter,
        toggleFilter,
        filterValue,
        filterContains
    };
}

// utility functions
function useUtils() {
    function encode(str: string) {
        return window.btoa(unescape(encodeURIComponent(str)));
    }
    function decode(str: string) {
        return decodeURIComponent(escape(window.atob(str)));
    }
    function isObject(v: any) {
        return v && typeof v == "object";
    }
    function isVal(v: any) {
        return v != null && v != undefined;
    }
    return { encode, decode, isObject, isVal };
}

// validate and parse options
function useOptions(opt: ListerOption) {
    // triggers
    let triggers = ["page", "limit", "sort", "order"];
    if (opt.triggers == "all") {
        triggers = ["page", "limit", "sort", "order", "search", "filters"];
    } else if (opt.triggers) {
        triggers = opt.triggers;
    }
    function mustTriggered(key: Trigger) {
        return triggers.includes(key);
    }
    // defaults
    const page: number = opt.page || 1;
    const limit: number = opt.limit || 25;
    const validLimits: number[] = opt.validLimits || [];
    const sort: string = opt.sort || "_id";
    const validSorts: string[] = opt.validSorts || [];
    const order: "asc" | "desc" = opt.order || "asc";
    const search: string = opt.search || "";
    const filters: Record<string, any> = opt.filters || {};
    return {
        mustTriggered,
        page,
        limit,
        sort,
        order,
        search,
        filters,
        limits: validLimits,
        sorts: validSorts
    };
}

// page stats and functions
function usePage(def: number) {
    const page = ref(def);
    return { page };
}

// limit stats and functions
function useLimit(def: number, defLimits: number[]) {
    const limits = ref(defLimits);
    const _limit = ref(def);
    const limit = computed({
        get: () => _limit.value,
        set: (v: number) => {
            (limits.value.length == 0 || limits.value.includes(v)) &&
                (_limit.value = v);
        }
    });
    return { limits, limit };
}

// sort stats and functions
function useSort(def: string, defSorts: string[]) {
    const sorts = ref(defSorts);
    const _sort = ref(def);
    const sort = computed({
        get: () => _sort.value,
        set: (v: string) => {
            (sorts.value.length == 0 || sorts.value.includes(v)) &&
                (_sort.value = v);
        }
    });
    return { sorts, sort };
}

// order stats and functions
function useOrder(def: "asc" | "desc") {
    const _order = ref(def);
    const order = computed({
        get: () => _order.value,
        set: (v: "asc" | "desc") => (_order.value = v)
    });
    return { order };
}

// search stats and functions
function useSearch(def: string) {
    const search = ref(def);
    const clearSearch = () => (search.value = "");
    return { search, clearSearch };
}

// filter stats and functions
function useFilter(def: Record<string, any>) {
    const filters = ref(def);
    const clearFilters = () => (filters.value = {});

    // remove filter
    function removeFilter(key: string) {
        key in filters.value && delete filters.value[key];
    }
    // set to null or undefined will remove filter
    function setFilter(key: string, value: any) {
        value ? (filters.value[key] = value) : removeFilter(key);
    }
    // push/remove item from arrayed filter
    function toggleFilter(key: string, value: any) {
        if (!value) return;
        const vals = Array.isArray(filters.value[key])
            ? (filters.value[key] as Array<any>)
            : [];
        const index = vals.indexOf(value);
        index == -1 ? vals.push(value) : vals.splice(index, 1);
        vals.length ? (filters.value[key] = vals) : removeFilter(key);
    }

    function filterValue<T = any>(k: string) {
        return computed<T>(() => filters.value[k]);
    }

    function filterContains(k: string, value: any) {
        return computed(
            () =>
                Array.isArray(filters.value[k]) &&
                (filters.value[k] as Array<any>).includes(value)
        );
    }

    return {
        filters,
        clearFilters,
        removeFilter,
        setFilter,
        toggleFilter,
        filterValue,
        filterContains
    };
}
