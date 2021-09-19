import { ref, computed } from "vue";
/**
 * Generate live timer object from millisecond
 *
 * @param ms milliseconds
 */
export function useTimer(ms: number) {
    let cb: () => void;
    const seconds = ref(+(ms / 1000).toFixed(0));
    const timer = computed(() => {
        const d = new Date(2020, 1, 1, 0, 0, 0, 0);
        d.setSeconds(seconds.value);
        const res: string[] = [];
        d.getHours() > 0
            ? res.push(`${d.getHours()}`.padStart(2, "0"))
            : res.push("00");
        d.getMinutes() > 0
            ? res.push(`${d.getMinutes()}`.padStart(2, "0"))
            : res.push("00");
        d.getSeconds() > 0
            ? res.push(`${d.getSeconds()}`.padStart(2, "0"))
            : res.push("00");

        function trimStr(str: string) {
            return str.replace(new RegExp("^(00:)"), "");
        }
        return trimStr(trimStr(res.join(":")));
    });
    const interval = setInterval(() => {
        seconds.value--;
        if (seconds.value <= 0) {
            clearInterval(interval);
            cb && cb();
        }
    }, 1000);

    function onComplete(callback: () => void) {
        cb = callback;
    }

    return { timer, onComplete };
}
