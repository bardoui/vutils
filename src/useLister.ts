import { ref, computed, watch } from "vue";
/**
 * manage list filters
 */
export function useLister(opt: ListerOption) {
    const query = ref<Record<string, unknown>>({});
    let locked = false; // lock auto apply
    const Opt = parseOptions(opt); // default options

    // utility functions
    const _ = {
        encode: (str: string) => window.btoa(unescape(encodeURIComponent(str))),
        decode: (str: string) => decodeURIComponent(escape(window.atob(str))),
        isObject: (v: any) => v && typeof v == "object",
        isVal: (v: any) => v != null && v != undefined,
        clone: (v: any) => JSON.parse(JSON.stringify(v)),
        arrayOf: (v: any) => (Array.isArray(v) ? v : []),
        numberOf: (v: any) => (Number.isInteger(v) ? v : 0),
        query: (k: string) => query.value[k],
        autoApply: (k: Trigger, v: unknown) =>
            !locked && Opt.isAuto(k) && (query.value[k] = v)
    };

    // Page
    const page = (() => {
        const _v = ref(Opt.page);
        const page = computed({
            get: () => _v.value,
            set: (v: number) => {
                v && v > 0 && (_v.value = v);
                _.autoApply("page", _v.value);
            }
        });
        const reset = () =>
            (page.value = _.numberOf(_.query("page")) || Opt.page);
        return { page, resetPage: reset };
    })();

    // Limit
    const limit = (() => {
        const _v = ref(Opt.limit);
        const limits = ref(Opt.limits);
        const limit = computed({
            get: () => _v.value,
            set: (v: number) => {
                const ls = limits.value || [];
                v &&
                    v > 0 &&
                    (ls.length == 0 || ls.includes(v)) &&
                    (_v.value = v);
                _.autoApply("limit", _v.value);
            }
        });
        const reset = () =>
            (limit.value = _.numberOf(_.query("limit")) || Opt.limit);
        return { limits, limit, resetLimit: reset };
    })();

    // Sort
    const sort = (() => {
        const _v = ref(Opt.sort);
        const sorts = ref(Opt.sorts);
        const sort = computed({
            get: () => _v.value,
            set: (v: string) => {
                const ls = sorts.value || [];
                v && (ls.length == 0 || ls.includes(v)) && (_v.value = v);
                _.autoApply("sort", _v.value);
            }
        });
        const reset = () =>
            (sort.value =
                (_.isVal(_.query("sort")) ? _.query("sort") + "" : "") ||
                Opt.sort);
        return { sorts, sort, resetSort: reset };
    })();

    // Order
    const order = (() => {
        const _v = ref(Opt.order);
        const order = computed({
            get: () => _v.value,
            set: (v: OrderType) => {
                ["asc", "desc"].includes(v) && (_v.value = v as OrderType);
                _.autoApply("order", _v.value);
            }
        });
        const reset = () =>
            (order.value = ["asc", "desc"].includes(`${_.query("order")}`)
                ? (`${_.query("order")}` as OrderType)
                : Opt.order);
        return { order, resetOrder: reset };
    })();

    // Search
    const search = (() => {
        const _v = ref(Opt.sort);
        const search = computed({
            get: () => _v.value,
            set: (v: string) => {
                _.isVal(v) && (_v.value = v);
                _.autoApply("search", _v.value);
            }
        });
        const reset = () =>
            (search.value =
                (_.isVal(_.query("search")) ? `${_.query("search")}` : "") ||
                Opt.search);
        return { search, resetSearch: reset };
    })();

    // Filter
    const { filters, ...filter } = (() => {
        const _v = ref(Opt.filters);
        const filters = computed({
            get: () => _v.value,
            set: v => {
                console.log("came");

                _v.value = v;
                _.autoApply("filters", _.clone(_v.value));
            }
        });
        const remove = (k: string) => {
            k in _v.value && delete _v.value[k];
            _.autoApply("filters", _.clone(_v.value));
        };
        const toggle = (k: string, v: any) => {
            v ? (_v.value[k] = v) : remove(k);
            _.autoApply("filters", _.clone(_v.value));
        };
        const toggleArray = (k: string, v: any) => {
            if (v) {
                const currentV = _.arrayOf(_v.value[k]);
                const index = currentV.indexOf(v);
                index === -1 ? currentV.push(v) : currentV.splice(index, 1);
                currentV.length ? (_v.value[k] = currentV) : remove(k);
            }
            _.autoApply("filters", _.clone(_v.value));
        };
        const filter = <T = any>(k: string) =>
            computed<T>({
                get: () => _v.value[k],
                set: (v: T) => toggle(k, v)
            });
        const value = <T = any>(k: string) => computed<T>(() => _v.value[k]);
        const exists = (k: string, v: any) =>
            computed(() => _.arrayOf(_v.value[k]).includes(v));
        const clear = () => (filters.value = {});
        const reset = () =>
            (filters.value = _.isObject(query.value)
                ? _.clone(_v.value)
                : _.clone(Opt.filters));
        return {
            filters,
            remove,
            toggle,
            toggleArray,
            filter,
            value,
            exists,
            clearFilters: clear,
            resetFilters: reset
        };
    })();

    const lister = (() => {
        type callback = (q: Record<string, unknown>, hash: string) => void;
        let cb: callback;
        watch(
            query,
            q => {
                cb && cb(q, _.encode(JSON.stringify(q)));
            },
            { deep: true }
        );
        const apply = (item: Trigger | "all" = "all") => {
            ["page", "all"].includes(item) &&
                (query.value["page"] = page.page.value);
            ["limit", "all"].includes(item) &&
                (query.value["limit"] = limit.limit.value);
            ["sort", "all"].includes(item) &&
                (query.value["sort"] = sort.sort.value);
            ["order", "all"].includes(item) &&
                (query.value["order"] = order.order.value);
            ["search", "all"].includes(item) &&
                (query.value["search"] = search.search.value);
            ["filters", "all"].includes(item) &&
                (query.value["filters"] = _.clone(filters.value));
        };
        const onApply = (callback: callback) => (cb = callback);
        const reset = () => {
            locked = true;
            page.resetPage();
            limit.resetLimit();
            sort.resetSort();
            order.resetOrder();
            search.resetSearch();
            locked = false;
        };
        const parseJson = (raw: any) => {
            locked = true;
            try {
                if (_.isObject(raw)) {
                    query.value = raw;
                    page.page.value = raw.page;
                    limit.limit.value = raw.limit;
                    sort.sort.value = raw.sort;
                    order.order.value = raw.order;
                    search.search.value = raw.search;
                    _.isObject(raw.filters) &&
                        (filters.value = _.clone(raw.filters));
                    apply();
                }
            } catch {
                //
            }
            locked = false;
        };
        const parseHash = (hashed: string) => {
            try {
                const json = _.decode(hashed);
                const raw = JSON.parse(json);
                parseJson(raw);
            } catch {
                //
            }
        };
        const coms = {
            query: computed(() => query.value),
            hash: computed(() => _.encode(JSON.stringify(query.value))),
            records: computed(() => _.arrayOf(_.query("data"))),
            isEmpty: computed(() => !_.arrayOf(_.query("data")).length),
            total: computed(() => _.numberOf(_.query("total"))),
            from: computed(() => _.numberOf(_.query("from"))),
            to: computed(() => _.numberOf(_.query("to"))),
            pages: computed(() => _.numberOf(_.query("pages")))
        };
        return { reset, apply, onApply, parseJson, parseHash, ...coms };
    })();

    return {
        ...page,
        ...limit,
        ...sort,
        ...order,
        ...search,
        ...filter,
        ...lister
    };
}

// validate and parse options
function parseOptions(opt: ListerOption) {
    // triggers
    let triggers = ["page", "limit", "sort", "order"];
    if (opt.triggers == "all") {
        triggers = ["page", "limit", "sort", "order", "search", "filters"];
    } else if (opt.triggers) {
        triggers = opt.triggers;
    }
    function isAuto(key: Trigger) {
        return triggers.includes(key);
    }
    // defaults
    const page: number = opt.page || 1;
    const limit: number = opt.limit || 25;
    const validLimits: number[] = opt.validLimits || [];
    const sort: string = opt.sort || "_id";
    const validSorts: string[] = opt.validSorts || [];
    const order: OrderType = opt.order || "asc";
    const search: string = opt.search || "";
    const filters: Record<string, any> = opt.filters || {};
    return {
        isAuto,
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

type OrderType = "asc" | "desc";
type Trigger = "page" | "limit" | "sort" | "order" | "search" | "filters";
interface ListerOption {
    triggers?: Trigger[] | "all";
    page?: number;
    limit?: number;
    validLimits?: number[];
    sort?: string;
    validSorts?: string[];
    order?: OrderType;
    search?: string;
    filters?: Record<string, any>;
}