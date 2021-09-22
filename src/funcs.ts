import { Slot, Comment } from "vue";

/**
 * check if slot not passed or empty
 *
 * @param slot slot
 * @returns boolean
 */
export function isEmptySlot(slot: Slot | undefined): boolean {
    return !(
        slot &&
        slot() &&
        slot().filter(i => i.type != Comment).length > 0
    );
}
