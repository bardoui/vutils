import { ref, computed, watch } from "vue";
/**
 * manage list filters
 */
export function useLister(opt: ListerOption) {
    const response = ref<Record<string, unknown>>({});
    let locked = false; // lock auto apply
    let respHash = ""; // keep response hash for prevent onApply after parsing response
    const Opt = parseOptions(opt); // default options

    // utility functions
    const _ = {
        encode: (str: string) => window.btoa(unescape(encodeURIComponent(str))),
        decode: (str: string) => decodeURIComponent(escape(window.atob(str))),
        isObject: (v: any) => v && typeof v === "object",
        objectOf: (v: any) => (v && typeof v === "object" ? v : {}),
        isVal: (v: any) => v != null && v !== undefined,
        clone: (v: any) => JSON.parse(JSON.stringify(v)),
        arrayOf: (v: any) => (Array.isArray(v) ? v : []),
        numberOf: (v: any) => (Number.isInteger(v) ? v : 0),
        resp: (k: string) => response.value[k],
        autoApply: (k: Trigger, v: unknown) =>
            !locked && Opt.isAuto(k) && (response.value[k] = v)
    };

    // Page
    const page = (() => {
        const _v = ref(Opt.page);
        const page = computed({
            get: () => _v.value,
            set: (v: number) => {
                _.numberOf(v) > 0 && (_v.value = v);
                _.autoApply("page", _v.value);
            }
        });
        return { page };
    })();

    // Limit
    const limit = (() => {
        const _v = ref(Opt.limit);
        const limits = ref(Opt.limits);
        const limit = computed({
            get: () => _v.value,
            set: (v: number) => {
                const ls = limits.value || [];
                _.numberOf(v) > 0 &&
                    (ls.length == 0 || ls.includes(v)) &&
                    (_v.value = v);
                _.autoApply("limit", _v.value);
            }
        });
        return { limits, limit };
    })();

    // Sort
    const sort = (() => {
        const _v = ref(Opt.sort);
        const sorts = ref(Opt.sorts);
        const sort = computed({
            get: () => _v.value,
            set: (v: string) => {
                const ls = sorts.value || [];
                if (v && (ls.length == 0 || ls.includes(v))) {
                    if (_v.value == v) {
                        order.order.value =
                            order.order.value == "asc" ? "desc" : "asc";
                    } else {
                        _v.value = v;
                        order.order.value = "asc";
                    }
                }
                _.autoApply("sort", _v.value);
            }
        });
        return { sorts, sort };
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
        return { order };
    })();

    // Search
    const search = (() => {
        const _v = ref(Opt.search);
        const search = computed({
            get: () => _v.value,
            set: (v: string) => {
                _.isVal(v) && (_v.value = v);
                _.autoApply("search", _v.value);
            }
        });

        function clearSearch() {
            _v.value = "";
            lister.apply(["search"]);
        }
        return { search, clearSearch };
    })();

    // Filter
    const { filters, ...filter } = (() => {
        const _v = ref(Opt.filters);
        const filters = computed({
            get: () => _v.value,
            set: v => {
                _v.value = _.objectOf(v);
                _.autoApply("filters", _.clone(_v.value));
            }
        });
        const remove = (k: string) => {
            k in _v.value && delete _v.value[k];
            _.autoApply("filters", _.clone(_v.value));
        };
        const toggle = (k: string, v: any) => {
            v !== undefined ? (_v.value[k] = v) : remove(k);
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
        const valueOf = <T = any>(k: string) => computed<T>(() => _v.value[k]);
        const exists = (k: string, v: any) =>
            computed(() => _.arrayOf(_v.value[k]).includes(v));
        const clear = () => (filters.value = {});
        return {
            filters,
            remove,
            toggle,
            toggleArray,
            filter,
            valueOf,
            exists,
            clearFilters: clear
        };
    })();

    const lister = (() => {
        // Helpers
        const _params = (v: any) => {
            const { page, limit, sort, order, search, filters } = _.objectOf(v);
            return { page, limit, sort, order, search, filters };
        };
        const _resolve = (raw: any) => {
            const obj = _.objectOf(raw);
            response.value = obj;
            page.page.value = obj.page;
            limit.limit.value = obj.limit;
            sort.sort.value = obj.sort;
            order.order.value = obj.order;
            search.search.value = obj.search;
            _.isObject(obj.filters) && (filters.value = _.clone(obj.filters));
        };
        // Methods
        const apply = (item: Trigger[] | "all" = "all") => {
            if (item === "all") {
                item = ["page", "limit", "sort", "order", "search", "filters"];
            }
            item.includes("page") && (response.value["page"] = page.page.value);
            item.includes("limit") &&
                (response.value["limit"] = limit.limit.value);
            item.includes("sort") && (response.value["sort"] = sort.sort.value);
            item.includes("order") &&
                (response.value["order"] = order.order.value);
            item.includes("search") &&
                (response.value["search"] = search.search.value);
            item.includes("filters") &&
                (response.value["filters"] = _.clone(filters.value));
        };
        const reset = (item: Trigger[] | "all" = "all") => {
            if (item === "all") {
                item = ["page", "limit", "sort", "order", "search", "filters"];
            }
            locked = true;
            if (item.includes("page")) {
                page.page.value = _.numberOf(_.resp("page")) || Opt.page;
            }
            if (item.includes("limit")) {
                limit.limit.value = _.numberOf(_.resp("limit")) || Opt.limit;
            }
            if (item.includes("sort")) {
                sort.sort.value =
                    (_.isVal(_.resp("sort")) ? _.resp("sort") + "" : "") ||
                    Opt.sort;
            }
            if (item.includes("order")) {
                order.order.value = ["asc", "desc"].includes(
                    `${_.resp("order")}`
                )
                    ? (`${_.resp("order")}` as OrderType)
                    : Opt.order;
            }
            if (item.includes("search")) {
                search.search.value =
                    (_.isVal(_.resp("search")) ? `${_.resp("search")}` : "") ||
                    Opt.search;
            }
            if (item.includes("filters")) {
                filters.value = _.isObject(_.resp("filters"))
                    ? _.clone(_.resp("filters"))
                    : _.clone(Opt.filters);
            }
            locked = false;
        };
        const parseJson = (raw: any) => {
            locked = true;
            const obj = _.objectOf(raw);
            respHash = _.encode(
                JSON.stringify(
                    _params(
                        Object.assign(
                            {},
                            _.clone(_.objectOf(response.value)),
                            obj
                        )
                    )
                )
            );
            _resolve(obj);
            apply();
            locked = false;
        };
        const parseHash = (hashed: string) => {
            try {
                _resolve(JSON.parse(_.decode(hashed)));
                apply();
            } catch {
                //
            }
        };
        // Computed
        const params = computed(() => _params(response.value));
        const resp = computed(() => response.value);
        const hash = computed(() => _.encode(JSON.stringify(params.value)));
        const records = computed(() => _.arrayOf(_.resp("data")));
        const isEmpty = computed(() => !_.arrayOf(_.resp("data")).length);
        const total = computed(() => _.numberOf(_.resp("total")));
        const from = computed(() => _.numberOf(_.resp("from")));
        const to = computed(() => _.numberOf(_.resp("to")));
        const pages = computed(() => _.numberOf(_.resp("pages")));
        // onApply callback
        type callback = (params: Record<string, unknown>, hash: string) => void;
        let cb: callback;
        const onApply = (callback: callback) => (cb = callback);
        watch(
            hash,
            (n, o) => cb && n !== o && n !== respHash && cb(params.value, n)
        );
        return {
            reset,
            apply,
            onApply,
            parseJson,
            parseHash,
            params,
            response: resp,
            hash,
            records,
            isEmpty,
            total,
            from,
            to,
            pages
        };
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
