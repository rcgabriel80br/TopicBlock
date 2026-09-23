import { Logger } from "./js/core/logger.js";
import { Storage } from "./js/core/storage.js";
import { App } from "./js/core/app.js";
import { createStatistics } from "./js/core/statistics.js";
const statistics = createStatistics(chrome.storage);
App.init();
chrome.runtime.onInstalled.addListener(async () => {
    Logger.log("Installed.");
    const settings = await Storage.loadSettings();
    await Storage.saveSettings(settings);
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let operation;
    if (message.action === "incrementBlockedTotal") {
        operation = statistics.increment(message.amount);
    } else if (message.action === "getStatistics") {
        operation = statistics.read();
    } else {
        return false;
    }
    operation.then(
        counters => sendResponse({ success: true, ...counters }),
        error => {
            Logger.error("Failed to update statistics:", error);
            sendResponse({ success: false, error: error.message });
        }
    );
    // Keep the message channel open until the queued storage operation finishes.
    return true;
});
