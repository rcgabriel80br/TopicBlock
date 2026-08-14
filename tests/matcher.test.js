import assert from "node:assert/strict";
import test from "node:test";

import {
    DEFAULT_GROUPS
} from "../js/core/constants.js";

await import("../js/shared/matcher.js");

const {
    findBlockedMatch,
    normalizeSearchText
} = globalThis.TopicBlockMatcher;

test("normalizes case, accents, and whitespace", () => {
    assert.equal(
        normalizeSearchText("  Karol  Conká  "),
        "karol conka"
    );
});

test("matches words that end with accented characters", () => {
    const entries = [
        { word: "xamã", group: "music" },
        { word: "pornô", group: "adult" },
        { word: "paredão", group: "bbb" }
    ];

    assert.deepEqual(
        findBlockedMatch(
            "Xamã anuncia uma nova música",
            entries
        ),
        { word: "xamã", group: "music" }
    );
    assert.deepEqual(
        findBlockedMatch(
            "Notícia sobre conteúdo porno",
            entries
        ),
        { word: "pornô", group: "adult" }
    );
    assert.deepEqual(
        findBlockedMatch(
            "O paredao será formado hoje",
            entries
        ),
        { word: "paredão", group: "bbb" }
    );
});

test("matches phrases and returns the diagnostic group", () => {
    const entries = [
        {
            word: "ana castela",
            group: "influencers"
        }
    ];

    assert.deepEqual(
        findBlockedMatch(
            "Veja: Ana   Castela lança projeto",
            entries
        ),
        {
            word: "ana castela",
            group: "influencers"
        }
    );
});

test("does not match a blocked word inside a larger word", () => {
    const entries = [
        { word: "bbb", group: "bbb" },
        { word: "xamã", group: "music" }
    ];

    assert.equal(
        findBlockedMatch("bbb27 começa hoje", entries),
        null
    );
    assert.equal(
        findBlockedMatch("Festival de xamãs", entries),
        null
    );
});

test("matches every default string entry", () => {
    const entries =
        Object.entries(DEFAULT_GROUPS)
            .flatMap(([group, definition]) =>
                definition.words
                    .filter(
                        word =>
                            typeof word === "string"
                    )
                    .map(word => ({ word, group }))
            );

    for (const entry of entries) {
        assert.deepEqual(
            findBlockedMatch(
                `headline ${entry.word} today`,
                [entry]
            ),
            entry,
            `Default entry did not match: ${entry.word}`
        );
    }
});
