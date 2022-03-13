import { ref, computed, watch, WritableComputedRef, ComputedRef } from "vue";

type Store = "limit" | "sort" | "order";
type OrderType = "asc" | "desc";
type Trigger = "page" | "limit" | "sort" | "order" | "search" | "filters";
type Callback = (params: Record<string, unknown>, hash: string) => void;

interface ListerOption {
    triggers?: Trigger[] | "all";
    stores?: Store[];
    limits?: number[];
    sorts?: string[];

    page?: number;
    limit?: number;
    sort?: string;
    order?: OrderType;
    search?: string;
    filters?: Record<string, unknown>;
}

interface Lister {
    page: WritableComputedRef<number>;
    limit: WritableComputedRef<number>;
    sort: WritableComputedRef<string>;
    order: WritableComputedRef<OrderType>;
    search: WritableComputedRef<string>;
    clearSearch: () => void;
    removeFilter: (key: string) => void;
    toggleFilter: (key: string, v: unknown) => void;
    toggleFilterArr: (key: string, v: unknown) => void;
    filter: <T = unknown>(key: string) => WritableComputedRef<T>;
    filterValue: <T = any>(k: string) => void;
    filterExists: (k: string, v: any) => ComputedRef<boolean>;
    clearFilters: () => void;
    apply: (items?: Trigger[] | "all") => void;
    reset: (items?: Trigger[] | "all") => void;
    parseJson: (raw: any) => void;
    parseHash: (hashed: string) => void;
    onApply: (callback: Callback) => Callback;
    params: ComputedRef<{
        page: number;
        limit: number;
        sort: string;
        order: OrderType;
        search: string;
        filters: any;
    }>;
    response: ComputedRef<{
        [x: string]: unknown;
    }>;
    hash: ComputedRef<string>;
    records: ComputedRef<any[]>;
    isEmpty: ComputedRef<boolean>;
    total: ComputedRef<number>;
    from: ComputedRef<number>;
    to: ComputedRef<number>;
    pages: ComputedRef<number>;
}

function useUtils(opt: ListerOption, key: string) {
    // utils
    function encode(str: string) {
        return window.btoa(unescape(encodeURIComponent(str)));
    }
    function decode(str: string) {
        return decodeURIComponent(escape(window.atob(str)));
    }
    function isObject(v: any) {
        return v && typeof v === "object";
    }
    function objectOf(v: any) {
        return v && typeof v === "object" ? v : {};
    }
    function isVal(v: any) {
        return v != null && v !== undefined;
    }
    function clone(v: any) {
        return JSON.parse(JSON.stringify(v));
    }
    function arrayOf(v: any) {
        return Array.isArray(v) ? v : [];
    }
    function numberOf(v: any) {
        return Number.isInteger(v) ? +v : 0;
    }

    // options
    const triggers =
        opt.triggers == "all"
            ? ["page", "limit", "sort", "order", "search", "filters"]
            : opt.triggers || ["page", "limit", "sort", "order"];
    function mustTrigger(key: Trigger) {
        return triggers.includes(key);
    }
    const stores = Array.isArray(opt.stores) ? opt.stores : [];
    function isStored(key: Store): boolean {
        return stores.includes(key);
    }
    const limits = Array.isArray(opt.limits) ? opt.limits : [];
    function isValidLimit(limit: number) {
        return limits.length == 0 || limits.includes(limit);
    }
    const sorts = Array.isArray(opt.sorts) ? opt.sorts : [];
    function isValidSort(sort: string) {
        return (
            sort && sort.trim() && (sorts.length == 0 || sorts.includes(sort))
        );
    }
    const options = {
        page: opt.page || 1,
        limit: opt.limit || 25,
        sort: opt.sort || "_id",
        order: opt.order || "asc",
        search: opt.search || "",
        filters: opt.filters || {}
    };

    // check store
    if (key && key.trim() && localStorage) {
        if (isStored("limit")) {
            options.limit =
                +(localStorage.getItem(`${key}::limit`) + "") || options.limit;
        }
        if (isStored("sort")) {
            options.sort =
                localStorage.getItem(`${key}::sort`) + "" || options.sort;
        }
        if (isStored("order")) {
            options.order = (localStorage.getItem(`${key}::order`) + "" ||
                options.order) as OrderType;
        }
    }

    // return
    return {
        encode,
        decode,
        isObject,
        objectOf,
        isVal,
        clone,
        arrayOf,
        numberOf,
        mustTrigger,
        isStored,
        isValidLimit,
        isValidSort,
        ...options
    };
}

/**
 * manage list filters
 */
export function useLister(opt: ListerOption, key: string): Lister {
    const utils = useUtils(opt, key);

    let _locked = false; // lock auto apply
    let _hash = ""; // keep response hash for prevent onApply after parsing response
    let _callback: Callback | null = null;

    // stats
    const _response = ref<Record<string, unknown>>({});
    const _page = ref(utils.page);
    const _limit = ref(utils.limit);
    const _sort = ref(utils.sort);
    const _order = ref(utils.order);
    const _search = ref(utils.search);
    const _filters = ref(utils.filters);

    // helpers
    function _store() {
        if (key && key.trim() && localStorage) {
            if (utils.isStored("limit")) {
                localStorage.setItem(`${key}::limit`, _limit.value.toString());
            }
            if (utils.isStored("sort")) {
                localStorage.setItem(`${key}::sort`, _sort.value);
            }
            if (utils.isStored("order")) {
                localStorage.setItem(`${key}::order`, _order.value);
            }
        }
    }
    function _autoApply(items: Trigger[]) {
        if (!_locked) {
            for (const i of items) {
                if (utils.mustTrigger(i)) {
                    apply(items);
                }
            }
        }
    }
    function _params(v: any) {
        const { page, limit, sort, order, search, filters } = utils.objectOf(v);
        return {
            page: page as number,
            limit: limit as number,
            sort: sort as string,
            order: order as OrderType,
            search: search as string,
            filters
        };
    }
    function _parse(raw: any) {
        raw = utils.objectOf(raw);
        _response.value = raw;
        page.value = raw.page;
        limit.value = raw.limit;
        sort.value = raw.sort;
        order.value = raw.order;
        search.value = raw.search;
        filters.value = utils.clone(utils.objectOf(raw.filters));
    }

    // fields
    const page = computed({
        get: () => _page.value,
        set: (v: number) => {
            if (utils.numberOf(v) > 0) {
                _page.value = utils.numberOf(v);
                _autoApply(["page"]);
            }
        }
    });

    const limit = computed({
        get: () => _limit.value,
        set: (v: number) => {
            if (utils.isValidLimit(v) && utils.numberOf(v) > 0) {
                _limit.value = v;
                _autoApply(["limit"]);
            }
        }
    });

    const sort = computed({
        get: () => _sort.value,
        set: (v: string) => {
            if (utils.isValidSort(v)) {
                if (_sort.value == v) {
                    order.value = order.value == "asc" ? "desc" : "asc";
                } else {
                    _sort.value = v;
                    _order.value = "asc";
                    _autoApply(["sort", "order"]);
                }
            }
        }
    });

    const order = computed({
        get: () => _order.value,
        set: (v: OrderType) => {
            if (["asc", "desc"].includes(v)) {
                _order.value = v as OrderType;
                _autoApply(["order"]);
            }
        }
    });

    const search = computed({
        get: () => _search.value,
        set: (v: string) => {
            if (utils.isVal(v)) {
                _search.value = v;
                _autoApply(["search"]);
            }
        }
    });
    function clearSearch() {
        _search.value = "";
        apply(["search"]);
    }

    const filters = computed({
        get: () => _filters.value,
        set: v => {
            _filters.value = utils.objectOf(v);
            _autoApply(["filters"]);
        }
    });
    function removeFilter(key: string) {
        if (key in _filters.value) {
            delete _filters.value[key];
            _autoApply(["filters"]);
        }
    }
    function toggleFilter(key: string, v: unknown) {
        if (v === undefined) {
            removeFilter(key);
        } else {
            _filters.value[key] = v;
            _autoApply(["filters"]);
        }
    }
    function toggleFilterArr(key: string, v: unknown) {
        if (v) {
            const currentV = utils.arrayOf(_filters.value[key]);
            const index = currentV.indexOf(v);
            index === -1 ? currentV.push(v) : currentV.splice(index, 1);
            if (currentV.length) {
                _filters.value[key] = currentV;
                _autoApply(["filters"]);
            } else {
                removeFilter(key);
            }
        }
    }
    function filter<T = unknown>(key: string) {
        return computed<T>({
            get: (): T => _filters.value[key] as T,
            set: (v: T) => toggleFilter(key, v)
        });
    }
    function filterValue<T = any>(k: string) {
        computed<T>(() => _filters.value[k] as T);
    }
    function filterExists(k: string, v: any) {
        return computed(() => utils.arrayOf(_filters.value[k]).includes(v));
    }
    function clearFilters() {
        apply(["filters"]);
    }

    function apply(items: Trigger[] | "all" = "all") {
        items =
            items == "all"
                ? ["page", "limit", "sort", "order", "search", "filters"]
                : items;

        const resp = utils.clone(utils.objectOf(_response.value));
        items.includes("page") && (resp["page"] = page.value);
        items.includes("limit") && (resp["limit"] = limit.value);
        items.includes("sort") && (resp["sort"] = sort.value);
        items.includes("order") && (resp["order"] = order.value);
        items.includes("search") && (resp["search"] = search.value);
        items.includes("filters") &&
            (resp["filters"] = utils.clone(filters.value));
        _response.value = utils.clone(resp);
    }
    function reset(items: Trigger[] | "all" = "all") {
        items =
            items == "all"
                ? ["page", "limit", "sort", "order", "search", "filters"]
                : items;
        _locked = true;
        if (items.includes("page")) {
            page.value = utils.numberOf(_response.value["page"]) || utils.page;
        }
        if (items.includes("limit")) {
            limit.value =
                utils.numberOf(_response.value["limit"]) || utils.limit;
        }
        if (items.includes("sort")) {
            const _sort = utils.isVal(_response.value["sort"])
                ? `${_response.value["sort"]}`
                : "";
            sort.value = _sort || utils.sort;
        }
        if (items.includes("order")) {
            const _order = `${_response.value["order"]}`;
            order.value = ["asc", "desc"].includes(_order)
                ? (_order as OrderType)
                : utils.order;
        }
        if (items.includes("search")) {
            const _search = utils.isVal(_response.value["search"])
                ? `${_response.value["sort"]}`
                : "";
            search.value = _search || utils.search;
        }
        if (items.includes("filters")) {
            filters.value = utils.isObject(_response.value["filters"])
                ? utils.clone(_response.value["filters"])
                : utils.clone(utils.filters);
        }
        _locked = false;
    }
    function parseJson(raw: any) {
        _locked = true;
        raw = Object.assign(
            {},
            utils.clone(utils.objectOf(_response.value)),
            utils.objectOf(raw)
        );
        _parse(raw);
        _hash = utils.encode(JSON.stringify(_params(_response.value)));
        apply();
        _locked = false;
    }
    function parseHash(hashed: string) {
        _locked = true;
        try {
            _parse(JSON.parse(utils.decode(hashed)));
            apply();
        } catch {
            //
        }
        _locked = false;
    }
    const onApply = (callback: Callback) => (_callback = callback);
    const params = computed(() => _params(_response.value));
    const response = computed(() => utils.clone(_response.value));
    const hash = computed(() => utils.encode(JSON.stringify(params.value)));
    const records = computed(() => utils.arrayOf(_response.value["data"]));
    const isEmpty = computed(() => records.value.length == 0);
    const total = computed(() => utils.numberOf(_response.value["total"]));
    const from = computed(() => utils.numberOf(_response.value["from"]));
    const to = computed(() => utils.numberOf(_response.value["to"]));
    const pages = computed(() => utils.numberOf(_response.value["pages"]));
    watch(hash, (n, o) => {
        if (_callback && n !== o && n !== _hash) {
            _callback(params.value, n);
            _store();
        }
    });

    return {
        page,
        limit,
        sort,
        order,
        search,
        clearSearch,
        removeFilter,
        toggleFilter,
        toggleFilterArr,
        filter,
        filterValue,
        filterExists,
        clearFilters,
        apply,
        reset,
        parseJson,
        parseHash,
        params,
        response,
        hash,
        records,
        isEmpty,
        total,
        from,
        to,
        pages,
        onApply
    };
}
