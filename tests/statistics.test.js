import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { createStatistics, STATISTICS_KEY, SESSION_KEY } from "../js/core/statistics.js";

const SETTINGS_KEY = "topicblock_settings";
const tick = () => new Promise(resolve => setImmediate(resolve));

function storageMock(total = 0, session = 0) {
    const local = { [SETTINGS_KEY]: { blockedTotal: total, enabled: true } };
    const currentSession = { [SESSION_KEY]: session };
    const writes = [];
    const area = (data, name) => ({
        async get(keys) {
            // Snapshot before yielding to expose concurrent read/modify/write races.
            const result = Object.fromEntries((Array.isArray(keys) ? keys : [keys])
                .filter(key => key in data).map(key => [key, structuredClone(data[key])]));
            await tick();
            return result;
        },
        async set(values) {
            await tick();
            Object.assign(data, structuredClone(values));
            writes.push({ area: name, values });
        }
    });
    return { local, currentSession, writes, storage: {
        local: area(local, "local"), session: area(currentSession, "session")
    } };
}

test("migrates total 10 / session 18 using the available session count", async () => {
    const h = storageMock(10, 18);
    const statistics = createStatistics(h.storage);
    assert.deepEqual(await statistics.read(), { blockedTotal: 18, blockedSession: 18 });
    assert.equal(h.local[STATISTICS_KEY].blockedTotal, 18);
    assert.equal(h.local[SETTINGS_KEY].blockedTotal, 10, "legacy settings are not rewritten");
});

test("concurrent messages from multiple tabs preserve every increment", async () => {
    const h = storageMock(100, 10);
    const statistics = createStatistics(h.storage);
    const amounts = Array.from({ length: 30 }, (_, index) => index % 5 + 1);
    await Promise.all(amounts.map(amount => statistics.increment(amount)));
    const sum = amounts.reduce((a, b) => a + b, 0);
    assert.deepEqual(await statistics.read(), { blockedTotal: 100 + sum, blockedSession: 10 + sum });
});

test("saving stale popup settings cannot overwrite statistics and increments cannot overwrite rules", async () => {
    const h = storageMock(100, 10);
    const stalePopup = structuredClone(h.local[SETTINGS_KEY]);
    const statistics = createStatistics(h.storage);
    await statistics.read();
    const edited = { ...stalePopup, enabled: false, ignoredSites: ["example.com"] };
    await Promise.all([
        statistics.increment(5),
        h.storage.local.set({ [SETTINGS_KEY]: edited }),
        statistics.increment(3)
    ]);
    assert.deepEqual(await statistics.read(), { blockedTotal: 108, blockedSession: 18 });
    assert.deepEqual(h.local[SETTINGS_KEY], edited);
    assert.equal(h.writes.filter(write => SETTINGS_KEY in write.values).length, 1);
});

test("queued reads return a coherent pair after increments and do not write unnecessarily", async () => {
    const h = storageMock(20, 4);
    const statistics = createStatistics(h.storage);
    await statistics.read();
    const increment = statistics.increment(6);
    const snapshot = statistics.read();
    await increment;
    assert.deepEqual(await snapshot, { blockedTotal: 26, blockedSession: 10 });
    const writes = h.writes.length;
    await statistics.read();
    assert.equal(h.writes.length, writes);
});

test("worker restart and browser session reset retain the migrated historical total", async () => {
    const h = storageMock(100, 10);
    await createStatistics(h.storage).increment(5);
    h.local[SETTINGS_KEY].blockedTotal = 999; // Legacy values are no longer authoritative.
    assert.deepEqual(await createStatistics(h.storage).read(), { blockedTotal: 105, blockedSession: 15 });
    delete h.currentSession[SESSION_KEY];
    assert.deepEqual(await createStatistics(h.storage).read(), { blockedTotal: 105, blockedSession: 0 });
});

test("invalid messages and a failed write do not poison subsequent operations", async () => {
    const h = storageMock(); const statistics = createStatistics(h.storage);
    for (const amount of [0, -1, 1.5, "2", NaN, Infinity]) {
        await assert.rejects(statistics.increment(amount), /Invalid blocked count/);
    }
    await statistics.read();
    const set = h.storage.local.set;
    h.storage.local.set = async () => { throw new Error("Storage unavailable"); };
    await assert.rejects(statistics.increment(2), /Storage unavailable/);
    h.storage.local.set = set;
    assert.deepEqual(await statistics.increment(3), { blockedTotal: 3, blockedSession: 3 });
});

test("background keeps asynchronous message channels open and responds with serialized snapshots", async () => {
    const h = storageMock(10, 18);
    let listener;
    const source = (await readFile(new URL("../background.js", import.meta.url), "utf8"))
        .replace(/^import .*;\r?\n/gm, "");
    vm.runInNewContext(source, {
        createStatistics,
        Logger: { error() {} }, App: { init() {} },
        chrome: { storage: h.storage, runtime: {
            onInstalled: { addListener() {} },
            onMessage: { addListener: fn => { listener = fn; } }
        } }
    });
    const send = message => new Promise(resolve => {
        assert.equal(listener(message, {}, resolve), true);
    });
    const [increment, snapshot] = await Promise.all([
        send({ action: "incrementBlockedTotal", amount: 2 }),
        send({ action: "getStatistics" })
    ]);
    for (const result of [increment, snapshot]) {
        assert.equal(result.success, true);
        assert.equal(result.blockedTotal, 20);
        assert.equal(result.blockedSession, 20);
    }
    assert.equal((await send({ action: "incrementBlockedTotal", amount: -1 })).success, false);
});
