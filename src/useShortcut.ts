import { ref, onMounted, onUnmounted } from "vue";

export interface ShortcutHandler {
    key: string | Array<string>;
    callback: (e: KeyboardEvent) => void;
    prevent: boolean;
    stop: boolean;
}

/**
 * Register global keyboard handler
 */
export function useShortcut() {
    const handlers = ref<ShortcutHandler[]>([]);
    function addShortcut(handler: ShortcutHandler) {
        if (handler.key && handler.key.length && handler.callback) {
            handler.key = Array.isArray(handler.key)
                ? handler.key
                : [handler.key];
            handlers.value.push(handler);
        }
    }
    function _keyDownHandler(e: KeyboardEvent): void {
        for (const handler of handlers.value) {
            if (!handler.key.includes(e.key)) continue;
            handler.prevent && e.preventDefault();
            handler.stop && e.stopPropagation();
            handler.callback(e);
        }
    }

    onMounted(() => {
        document.addEventListener("keydown", _keyDownHandler);
    });
    onUnmounted(() => {
        document.removeEventListener("keydown", _keyDownHandler);
    });

    return { addShortcut };
}
