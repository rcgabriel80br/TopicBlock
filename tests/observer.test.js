import assert from "node:assert/strict";
import test from "node:test";

test("continuous mutations cannot postpone a scan indefinitely", async () => {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    const originalMutationObserver = globalThis.MutationObserver;
    const originalSetTimeout = globalThis.setTimeout;
    const originalClearTimeout = globalThis.clearTimeout;

    let mutationCallback;
    let scheduledCallback;
    let scheduledCount = 0;
    let clearedCount = 0;

    globalThis.window = {};
    globalThis.document = { body: {} };
    globalThis.MutationObserver = class {
        constructor(callback) {
            mutationCallback = callback;
        }

        observe() {}
        disconnect() {}
    };
    globalThis.setTimeout = callback => {
        scheduledCallback = callback;
        scheduledCount += 1;
        return scheduledCount;
    };
    globalThis.clearTimeout = () => {
        clearedCount += 1;
    };

    try {
        await import(`../content/observer.js?test=${Date.now()}`);

        let scanCount = 0;
        const observer = new window.Observer(() => {
            scanCount += 1;
        });
        observer.start();

        mutationCallback();
        mutationCallback();
        mutationCallback();

        assert.equal(scheduledCount, 1);
        assert.equal(clearedCount, 0);

        scheduledCallback();
        assert.equal(scanCount, 1);
    } finally {
        globalThis.window = originalWindow;
        globalThis.document = originalDocument;
        globalThis.MutationObserver = originalMutationObserver;
        globalThis.setTimeout = originalSetTimeout;
        globalThis.clearTimeout = originalClearTimeout;
    }
});