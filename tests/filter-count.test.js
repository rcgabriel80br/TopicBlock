import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

function element(text = "") {
    const classes = new Set();
    return {
        tagName: "DIV",
        innerText: text,
        innerHTML: text,
        dataset: {},
        style: {},
        children: [],
        classList: {
            contains: name => classes.has(name),
            add: name => classes.add(name)
        },
        closest(selector) {
            if (selector === ".topicblock-blocked" && classes.has("topicblock-blocked")) return this;
            if (selector === "[data-topicblock-hidden='1']" && this.dataset.topicblockHidden === "1") return this;
            return null;
        },
        getAttribute: () => null,
        append(...nodes) { this.children.push(...nodes); },
        appendChild(node) { this.children.push(node); }
    };
}

test("counts initial and lazy-loaded blocks once across repeated scans", async () => {
    const cards = [];
    const messages = [];
    const context = vm.createContext({
        console, Date,
        Event: class {},
        MutationObserver: class { observe() {} disconnect() {} },
        sessionStorage: { getItem: () => null, removeItem() {} },
        location: { href: "https://example.com/" },
        window: { location: { hostname: "example.com" }, dispatchEvent() {} },
        document: {
            querySelectorAll: () => cards,
            body: { contains: card => cards.includes(card) },
            createElement: () => element()
        },
        chrome: {
            i18n: { getMessage: () => "" },
            storage: { local: { get: async () => ({
                topicblock_settings: {
                    enabled: true,
                    groups: { custom: { enabled: true, words: ["topic"] } }
                }
            }) } },
            runtime: {
                onMessage: { addListener() {} },
                sendMessage: message => messages.push(message)
            }
        }
    });
    for (const path of ["js/shared/matcher.js", "js/shared/sites.js", "content/filter.js"]) {
        vm.runInContext(await readFile(new URL(`../${path}`, import.meta.url), "utf8"), context);
    }
    await new Promise(resolve => setImmediate(resolve));
    // Isolate card selection; run the real scan and blocking/counting logic.
    vm.runInContext("getContainer = topic => topic", context);
    const scan = () => vm.runInContext("scanPage()", context);
    const amounts = () => messages.map(message => message.amount);

    cards.push(element("topic"), element("topic"), element("topic"));
    scan();
    assert.deepEqual(amounts(), [3]);
    scan();
    assert.deepEqual(amounts(), [3], "unchanged cards must not be counted again");

    cards.push(element("topic"), element("topic"));
    scan();
    assert.deepEqual(amounts(), [3, 2], "lazy-loaded cards must add to the total");
    scan();
    assert.deepEqual(amounts(), [3, 2]);

    cards.push(element("unrelated"), element("topic"));
    scan();
    assert.deepEqual(amounts(), [3, 2, 1]);
    assert.equal(messages.reduce((sum, message) => sum + message.amount, 0), 6);
});
