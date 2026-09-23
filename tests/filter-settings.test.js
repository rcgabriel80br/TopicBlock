import assert from "node:assert/strict";
import test from "node:test";
import { element, harness, settings } from "./helpers/filter-harness.js";
const hidden = card => card.dataset.topicblockHidden === "1";

test("word edits reach multiple open pages and restore original nodes and attributes", async () => {
    for (const h of await Promise.all([harness(), harness()])) {
        const card = element("alpha beta");
        const originalNode = card.childNodes[0];
        card.setAttribute("style", "color: red");
        card.setAttribute("title", "original title");
        h.cards.push(card);
        h.update(settings(["alpha"]));
        assert.ok(hidden(card));
        h.update(settings(["beta"]));
        assert.ok(hidden(card), "another active term still blocks the card");
        h.update(settings());
        assert.ok(!hidden(card));
        assert.equal(card.childNodes[0], originalNode);
        assert.equal(card.getAttribute("style"), "color: red");
        assert.equal(card.getAttribute("title"), "original title");
        assert.equal(card.dataset.topicblockExcluded, undefined);
        assert.deepEqual(h.amounts(), [1]);
    }
});

test("global, group and ignored-site toggles restore and reapply without recounting", async () => {
    const h = await harness();
    const card = element("alpha"); h.cards.push(card);
    const active = settings(["alpha"]);
    h.update(active); assert.ok(hidden(card));
    for (const inactive of [
        { ...active, enabled: false },
        { ...active, groups: { custom: { enabled: false, words: ["alpha"] } } },
        { ...active, ignoredSites: ["example.com"] }
    ]) {
        h.update(inactive); assert.ok(!hidden(card));
        h.update(active); assert.ok(hidden(card));
    }
    assert.deepEqual(h.amounts(), [1]);
});

test("statistics-only writes do not rebuild blocked cards; reason changes update in place", async () => {
    const h = await harness(); const card = element("alpha"); h.cards.push(card);
    const active = settings(["alpha"]); h.update(active);
    const label = card.childNodes[0];
    h.update({ ...active, blockedTotal: 10 });
    assert.equal(card.childNodes[0], label);
    h.update({ ...active, showBlockReason: false });
    assert.equal(card.querySelector(".topicblock-block-reason").hidden, true);
    assert.equal(card.childNodes[0], label);
    h.update({ ...active, showBlockReason: true });
    assert.equal(card.querySelector(".topicblock-block-reason").hidden, false);
    h.update(settings(), "session"); assert.ok(hidden(card));
});

test("manually revealed cards remain visible after rule changes", async () => {
    const h = await harness(); const card = element("alpha beta"); h.cards.push(card);
    h.update(settings(["alpha"]));
    card.querySelector(".topicblock-show-content").onclick({ stopPropagation() {}, preventDefault() {} });
    assert.ok(!hidden(card));
    assert.equal(card.dataset.topicblockExcluded, "1");
    h.update(settings(["alpha", "beta"]));
    assert.ok(!hidden(card));
    assert.deepEqual(h.amounts(), [1]);
});

test("hibernation applies immediately and expires without another settings change", async () => {
    const h = await harness(); const card = element("alpha"); h.cards.push(card);
    const active = settings();
    active.groups.hibernated = { enabled: true, words: [{ text: "alpha", expires: new Date(h.now() + 1000).toISOString() }] };
    h.update(active); assert.ok(hidden(card));
    const timer = [...h.timers.values()][0]; assert.equal(timer.delay, 1000);
    h.advance(1000); timer.callback();
    assert.ok(!hidden(card));
    assert.deepEqual(h.amounts(), [1]);
});

test("30-day hibernation avoids timer overflow and removal cancels expiration", async () => {
    const h = await harness(); const card = element("alpha"); h.cards.push(card);
    const active = settings();
    active.groups.hibernated = { enabled: true, words: [{ text: "alpha", expires: new Date(h.now() + 30 * 86400000).toISOString() }] };
    h.update(active);
    assert.ok(hidden(card));
    assert.equal([...h.timers.values()][0].delay, 2147483647);
    h.update(settings());
    assert.ok(!hidden(card));
    assert.equal(h.timers.size, 0);
});

test("an expired hibernation does not reveal content blocked by another group", async () => {
    const h = await harness(); const card = element("alpha beta"); h.cards.push(card);
    const active = settings(["beta"]);
    active.groups.hibernated = { enabled: true, words: [{ text: "alpha", expires: new Date(h.now() + 1000).toISOString() }] };
    h.update(active);
    const timer = [...h.timers.values()][0];
    h.advance(1000); timer.callback();
    assert.ok(hidden(card));
    assert.deepEqual(h.amounts(), [1]);
});
