import { readFile } from "node:fs/promises";
import vm from "node:vm";

export function element(text = "") {
    const classes = new Set();
    const attributes = new Map();
    return {
        tagName: "DIV", dataset: {}, style: {},
        childNodes: text ? [{ textContent: text }] : [],
        get innerText() { return this.childNodes.map(n => n.textContent || n.innerText || "").join(" "); },
        get textContent() { return this.innerText; },
        set textContent(value) { this.childNodes = [{ textContent: value }]; },
        get className() { return [...classes].join(" "); },
        set className(value) { classes.clear(); value.split(" ").forEach(c => classes.add(c)); },
        classList: { contains: name => classes.has(name), add: name => classes.add(name), remove: name => classes.delete(name) },
        matches(selector) {
            if (selector === "*") return true;
            if (selector.startsWith(".")) return classes.has(selector.slice(1));
            if (selector === "[data-topicblock-hidden='1']") return this.dataset.topicblockHidden === "1";
            if (selector === "[data-topicblock-excluded='1']") return this.dataset.topicblockExcluded === "1";
            return false;
        },
        closest(selector) { return this.matches(selector) ? this : null; },
        querySelectorAll(selector) {
            return this.childNodes.flatMap(n => [
                ...(n.matches?.(selector) ? [n] : []),
                ...(n.querySelectorAll?.(selector) || [])
            ]);
        },
        querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
        getAttribute: name => attributes.get(name) ?? null,
        setAttribute: (name, value) => attributes.set(name, value),
        removeAttribute: name => attributes.delete(name),
        replaceChildren(...nodes) { this.childNodes = nodes; },
        append(...nodes) { this.childNodes.push(...nodes); },
        appendChild(node) { this.childNodes.push(node); }
    };
}

export function settings(words = []) {
    return { enabled: true, groups: { custom: { enabled: true, words } }, ignoredSites: [] };
}

export async function harness(initial = settings()) {
    const cards = [], messages = [], timers = new Map();
    let listener, clock = Date.now(), timerId = 0;
    class Clock extends Date {
        constructor(...args) { super(...(args.length ? args : [clock])); }
        static now() { return clock; }
    }
    const context = vm.createContext({
        console, Date: Clock,
        setTimeout: (callback, delay) => { timers.set(++timerId, { callback, delay }); return timerId; },
        clearTimeout: id => timers.delete(id),
        Event: class {},
        MutationObserver: class { observe() {} disconnect() {} },
        sessionStorage: { getItem: () => null, removeItem() {} },
        location: { href: "https://example.com/" },
        window: { location: { hostname: "example.com" }, dispatchEvent() {} },
        document: {
            querySelectorAll: selector => selector === "a, h1, h2, h3, span"
                ? cards : cards.flatMap(card => [
                    ...(card.matches(selector) ? [card] : []), ...card.querySelectorAll(selector)
                ]),
            body: { contains: card => cards.includes(card) },
            createElement: () => element()
        },
        chrome: {
            i18n: { getMessage: () => "" },
            storage: {
                onChanged: { addListener: fn => { listener = fn; } },
                local: { get: async () => ({ topicblock_settings: initial }) }
            },
            runtime: { onMessage: { addListener() {} }, sendMessage: message => messages.push(message) }
        }
    });
    for (const path of ["js/shared/matcher.js", "js/shared/sites.js", "content/filter.js"]) {
        vm.runInContext(await readFile(new URL(`../../${path}`, import.meta.url), "utf8"), context);
    }
    await new Promise(resolve => setImmediate(resolve));
    // Test actual filtering and restoration independently of portal-specific card selection.
    vm.runInContext("getContainer = topic => topic", context);
    return {
        cards, messages, timers,
        scan: () => vm.runInContext("scanPage()", context),
        update: (value, area = "local") => listener({ topicblock_settings: { newValue: value } }, area),
        advance: ms => { clock += ms; },
        now: () => clock,
        amounts: () => messages.map(message => message.amount)
    };
}
