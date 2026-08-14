import { STORAGE_KEYS } from "./constants.js";
import { mergeSettings } from "./settings.js";
export class Storage {
    static async loadSettings() {
        const data = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
        return mergeSettings(
            data[STORAGE_KEYS.SETTINGS]
        );
    }
    static async saveSettings(settings) {
        await chrome.storage.local.set({
            [STORAGE_KEYS.SETTINGS]: settings
        });
    }
}
