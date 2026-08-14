import {
    DEFAULT_GROUPS,
    EDITABLE_GROUP_NAMES,
    LEGACY_GROUP_IDS
} from "./constants.js";

export const DEFAULT_SETTINGS = {
    enabled: true,
    debug: true,
    showBlockReason: true,
    blockedTotal: 0,
    ignoredSites: [
        "google.com",
        "chatgpt.com",
        "wikipedia.org",
        "outlook.live.com",
        "web.whatsapp.com",
        "claude.ai"
    ],
    groups: DEFAULT_GROUPS
};

function isObject(value) {
    return Boolean(
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    );
}

function mergeGroups(savedGroups) {
    const groups =
        structuredClone(DEFAULT_GROUPS);

    EDITABLE_GROUP_NAMES.forEach(name => {
        groups[name].customized = false;
    });

    if (!isObject(savedGroups)) {
        return groups;
    }

    const migratedGroups = {};

    Object.entries(savedGroups)
        .forEach(([name, savedGroup]) => {
            const migratedName =
                LEGACY_GROUP_IDS[name] || name;

            if (
                !migratedGroups[migratedName] ||
                migratedName === name
            ) {
                migratedGroups[migratedName] =
                    savedGroup;
            }
        });

    Object.entries(migratedGroups)
        .forEach(([name, savedGroup]) => {
            if (!isObject(savedGroup)) {
                return;
            }

            if (!groups[name]) {
                if (Array.isArray(savedGroup.words)) {
                    groups[name] =
                        structuredClone(savedGroup);
                }

                return;
            }

            if (
                typeof savedGroup.enabled ===
                "boolean"
            ) {
                groups[name].enabled =
                    savedGroup.enabled;
            }

            if (
                EDITABLE_GROUP_NAMES
                    .includes(name)
            ) {
                const customized =
                    savedGroup.customized === true;

                groups[name].customized =
                    customized;

                if (
                    customized &&
                    Array.isArray(savedGroup.words)
                ) {
                    groups[name].words =
                        savedGroup.words.filter(
                            word =>
                                typeof word ===
                                "string"
                        );
                }

                return;
            }

            if (Array.isArray(savedGroup.words)) {
                groups[name].words =
                    structuredClone(
                        savedGroup.words
                    );
            }
        });

    return groups;
}

export function mergeSettings(savedSettings = {}) {
    const saved =
        isObject(savedSettings)
            ? savedSettings
            : {};

    const settings = {
        ...structuredClone(DEFAULT_SETTINGS),
        ...saved
    };

    settings.groups =
        mergeGroups(saved.groups);

    settings.ignoredSites =
        Array.isArray(saved.ignoredSites)
            ? structuredClone(saved.ignoredSites)
            : structuredClone(
                DEFAULT_SETTINGS.ignoredSites
            );

    return settings;
}
