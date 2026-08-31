import assert from "node:assert/strict";
import test from "node:test";

await import("../js/shared/sites.js");

const {
    normalizeSite,
    siteMatchesHostname
} = globalThis.TopicBlockSites;

test("normalizes a site entered by the user", () => {
    assert.equal(
        normalizeSite(
            "https://www.Terra.com.br/noticias"
        ),
        "terra.com.br"
    );
});

test("matches an ignored domain and its subdomains", () => {
    assert.equal(
        siteMatchesHostname(
            "www.terra.com.br",
            "terra.com.br"
        ),
        true
    );
    assert.equal(
        siteMatchesHostname(
            "noticias.terra.com.br",
            "terra.com.br"
        ),
        true
    );
    assert.equal(
        siteMatchesHostname(
            "example.com",
            "terra.com.br"
        ),
        false
    );
});
