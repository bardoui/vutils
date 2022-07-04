export type onMethodSuccess<T = unknown> = (method: string, data: T) => void;
export type onMethodError<T = unknown> = (method: string, err: T) => void;
export type onSuccess<T = unknown> = (data: T) => void;
export type onError<T = unknown> = (err: T) => void;

export class EventHub {
    private _passes: Record<string, any> = {};
    private _fails: Record<string, any> = {};
    private _pass: any = null;
    private _fail: any = null;

    /**
     * handle event result if method handler not registered
     *
     * @param fn callback to handle event result
     */
    public onSuccess<T = unknown>(fn: onMethodSuccess<T>): void {
        this._pass = fn;
    }

    /**
     * handle event error if method error handler not registered
     *
     * @param fn callback to handle event error
     */

    public onError<T = unknown>(fn: onMethodError<T>): void {
        this._fail = fn;
    }

    /**
     * register handler for event
     *
     * @param method method name
     * @param fn callback to handle event result
     */
    public onPass<T = unknown>(method: string, fn: onSuccess<T>): void {
        this._passes[method] = fn;
    }

    /**
     * register error handler for event
     *
     * @param method method name
     * @param fn callback to handle event error
     */
    public onFail<T = unknown>(method: string, fn: onError<T>): void {
        this._fails[method] = fn;
    }

    /**
     * fire success event for method
     *
     * @param method method name
     * @param v data
     */
    public pass(method: string, v: unknown): void {
        const cb = this._passes[method];
        if (cb) {
            cb(v);
        } else {
            this._pass && this._pass(method, v);
        }
    }

    /**
     * fire error event for method
     *
     * @param method method name
     * @param err error
     */
    public fail(method: string, err: unknown): void {
        const cb = this._fails[method];
        if (cb) {
            cb(err);
        } else {
            this._fail && this._fail(method, err);
        }
    }
}

/**
 * Create fresh event hub
 */
export function useEvent(cb: {
    onSuccess?: onMethodSuccess;
    onError?: onMethodError;
}): EventHub {
    const ev = new EventHub();
    cb.onSuccess && ev.onSuccess(cb.onSuccess);
    cb.onError && ev.onError(cb.onError);
    return ev;
}
