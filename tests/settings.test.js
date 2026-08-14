import assert from "node:assert/strict";
import test from "node:test";

import {
    DEFAULT_SETTINGS,
    mergeSettings
} from "../js/core/settings.js";

test("uses English group identifiers in new settings", () => {
    const settings = mergeSettings();

    assert.deepEqual(
        Object.keys(settings.groups),
        [
            "influencers",
            "music",
            "adult",
            "funk",
            "bbb",
            "custom",
            "hibernated"
        ]
    );
    assert.equal(settings.showBlockReason, true);
});

test("migrates legacy Portuguese group identifiers", () => {
    const expires = "2030-01-01T00:00:00.000Z";
    const settings = mergeSettings({
        groups: {
            musica: {
                enabled: false,
                customized: true,
                words: ["artista"]
            },
            adulto: {
                enabled: true,
                customized: true,
                words: ["termo adulto"]
            },
            personalizado: {
                enabled: true,
                words: ["meu termo"]
            },
            hibernados: {
                enabled: true,
                words: [
                    {
                        text: "assunto",
                        expires
                    }
                ]
            }
        }
    });

    assert.equal(settings.groups.musica, undefined);
    assert.equal(settings.groups.adulto, undefined);
    assert.equal(settings.groups.personalizado, undefined);
    assert.equal(settings.groups.hibernados, undefined);
    assert.equal(settings.groups.music.enabled, false);
    assert.deepEqual(
        settings.groups.music.words,
        ["artista"]
    );
    assert.deepEqual(
        settings.groups.adult.words,
        ["termo adulto"]
    );
    assert.deepEqual(
        settings.groups.custom.words,
        ["meu termo"]
    );
    assert.deepEqual(
        settings.groups.hibernated.words,
        [{ text: "assunto", expires }]
    );
});

test("prefers canonical group identifiers during migration", () => {
    const settings = mergeSettings({
        groups: {
            music: {
                enabled: true,
                customized: true,
                words: ["canonical"]
            },
            musica: {
                enabled: true,
                customized: true,
                words: ["legacy"]
            }
        }
    });

    assert.deepEqual(
        settings.groups.music.words,
        ["canonical"]
    );
});

test("keeps existing counters and ignored sites", () => {
    const settings = mergeSettings({
        blockedTotal: 42,
        ignoredSites: ["example.com"],
        showBlockReason: false
    });

    assert.equal(settings.blockedTotal, 42);
    assert.deepEqual(
        settings.ignoredSites,
        ["example.com"]
    );
    assert.equal(settings.showBlockReason, false);
    assert.notEqual(
        settings.ignoredSites,
        DEFAULT_SETTINGS.ignoredSites
    );
});
