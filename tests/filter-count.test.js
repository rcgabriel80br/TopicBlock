import assert from "node:assert/strict";
import test from "node:test";
import { element, harness, settings } from "./helpers/filter-harness.js";

test("counts initial and lazy-loaded blocks once across repeated scans", async () => {
    const h = await harness(settings(["topic"]));
    h.cards.push(element("topic"), element("topic"), element("topic"));
    h.scan();
    assert.deepEqual(h.amounts(), [3]);
    h.scan();
    assert.deepEqual(h.amounts(), [3], "unchanged cards must not be counted again");
    h.cards.push(element("topic"), element("topic"));
    h.scan();
    assert.deepEqual(h.amounts(), [3, 2], "lazy-loaded cards must add to the total");
    h.scan();
    assert.deepEqual(h.amounts(), [3, 2]);
    h.cards.push(element("unrelated"), element("topic"));
    h.scan();
    assert.deepEqual(h.amounts(), [3, 2, 1]);
    assert.equal(h.messages.reduce((sum, message) => sum + message.amount, 0), 6);
});
