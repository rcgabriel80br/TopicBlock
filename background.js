import { Logger } from "./js/core/logger.js";
import { Storage } from "./js/core/storage.js";
import { App } from "./js/core/app.js";
App.init();
chrome.runtime.onInstalled.addListener(async () => {
    Logger.log("Instalação.");
    const settings = await Storage.loadSettings();
    await Storage.saveSettings(settings);
});
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    Logger.log(message);
    if (
        message.action === "incrementBlockedTotal"
    ) {
        const settings =
            await Storage.loadSettings();
        // total histórico
        settings.blockedTotal =
            (settings.blockedTotal || 0) +
            message.amount;
        await Storage.saveSettings(settings);
        // contador da sessão atual
        const sessionData =
            await chrome.storage.session.get(
                "blockedSession"
            );
        const blockedSession =
            (sessionData.blockedSession || 0) +
            message.amount;
        await chrome.storage.session.set({
            blockedSession
        });
        Logger.log(
            "Total bloqueado atualizado:",
            settings.blockedTotal
        );
        Logger.log(
            "Bloqueados nesta sessão:",
            blockedSession
        );
    }
    sendResponse({
        success: true
    });
});