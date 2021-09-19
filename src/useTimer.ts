import { ref, computed } from "vue";
/**
 * Generate live timer object from millisecond
 */
export function useTimer() {
    let interval: number;
    const seconds = ref(0);
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
    const timerAlive = computed(() => seconds.value > 0);

    function startTimer(ms: number) {
        seconds.value = +(ms / 1000).toFixed(0);
        interval = setInterval(() => {
            seconds.value--;
            if (seconds.value <= 0) {
                stopTimer();
            }
        }, 1000);
    }
    function stopTimer() {
        clearInterval(interval);
        seconds.value = 0;
    }

    return { startTimer, stopTimer, timer, timerAlive };
}
