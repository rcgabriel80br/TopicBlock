import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
    GROUP_LABEL_MESSAGE_KEYS
} from "../js/core/constants.js";

async function readJson(path) {
    return JSON.parse(
        await readFile(
            new URL(path, import.meta.url),
            "utf8"
        )
    );
}

test("English and Brazilian Portuguese expose the same messages", async () => {
    const english =
        await readJson(
            "../_locales/en/messages.json"
        );
    const portuguese =
        await readJson(
            "../_locales/pt_BR/messages.json"
        );

    assert.deepEqual(
        Object.keys(english).sort(),
        Object.keys(portuguese).sort()
    );
});

test("manifest declares version 0.6.0 and localized metadata", async () => {
    const manifest =
        await readJson("../manifest.json");

    assert.equal(manifest.version, "0.6.0");
    assert.equal(manifest.default_locale, "en");
    assert.equal(manifest.name, "__MSG_extensionName__");
    assert.equal(
        manifest.description,
        "__MSG_extensionDescription__"
    );
    assert.deepEqual(
        manifest.content_scripts[0].js.slice(0, 2),
        [
            "js/shared/matcher.js",
            "js/shared/sites.js"
        ]
    );
});

test("source code only references messages present in both locales", async () => {
    const english =
        await readJson(
            "../_locales/en/messages.json"
        );
    const portuguese =
        await readJson(
            "../_locales/pt_BR/messages.json"
        );
    const sourcePaths = [
        "../content/filter.js",
        "../popup/popup.js",
        "../popup/popup.html"
    ];
    const referencedKeys = new Set(
        Object.values(
            GROUP_LABEL_MESSAGE_KEYS
        )
    );

    for (const path of sourcePaths) {
        const source = await readFile(
            new URL(path, import.meta.url),
            "utf8"
        );

        for (
            const match of source.matchAll(
                /getMessage\(\s*"([^"]+)"/g
            )
        ) {
            referencedKeys.add(match[1]);
        }

        for (
            const match of source.matchAll(
                /data-i18n(?:-placeholder)?="([^"]+)"/g
            )
        ) {
            referencedKeys.add(match[1]);
        }
    }

    for (const key of referencedKeys) {
        assert.ok(english[key], `Missing English message: ${key}`);
        assert.ok(
            portuguese[key],
            `Missing Brazilian Portuguese message: ${key}`
        );
    }
});
