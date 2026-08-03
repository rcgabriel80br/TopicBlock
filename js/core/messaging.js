export class Messaging {
    static send(type, data = {}) {
        return chrome.runtime.sendMessage({
            type,
            data
        });
    }
}