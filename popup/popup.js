import {
    DEFAULT_GROUPS,
    EDITABLE_GROUP_NAMES,
    GROUP_LABEL_MESSAGE_KEYS,
    STORAGE_KEYS
} from "../js/core/constants.js";

import {
    mergeSettings
} from "../js/core/settings.js";

import {
    getMessage,
    getUiLanguage,
    localizeDocument
} from "../js/core/i18n.js";

const $ = id => document.getElementById(id);
const {
    normalizeSite,
    siteMatchesHostname
} = globalThis.TopicBlockSites;

const toggle = $("toggle");
const toggleText = $("toggleText");
const showBlockReasonToggle = $("showBlockReason");
const showUnfilteredPageButton = $("showUnfilteredPage");
const groupList = $("groupList");
const wordList = $("wordList");
const wordCount = $("wordCount");
const input = $("newWord");
const addButton = $("addWord");
const resetButton = $("resetWords");
const hibernateInput = $("hibernateWord");
const hibernateList = $("hibernateList");
const hibernateCount = $("hibernateCount");
const ignoredSitesList = $("ignoredSitesList");
const ignoredSitesCount = $("ignoredSitesCount");
const ignoredSiteInput = $("newIgnoredSite");
const addIgnoredSiteButton = $("addIgnoredSite");
const ignoreCurrentSiteButton = $("ignoreCurrentSite");
const currentSiteMessage = $("currentSiteMessage");
const blockedSession = $("blockedSession");
const blockedTotal = $("blockedTotal");

const MAX_GROUP_WORDS = 250;
const MAX_WORD_LENGTH = 80;

let settings = mergeSettings();
let editingGroup = null;
let groupMessage = "";
let currentSite = "";
let currentTabId = null;

localizeDocument();

function getGroupLabel(name) {
    const messageKey =
        GROUP_LABEL_MESSAGE_KEYS[name];

    return messageKey
        ? getMessage(messageKey, undefined, name)
        : name;
}

function localizeDynamicControls() {
    [7, 15, 30].forEach(days => {
        const button = $("hibernate" + days);

        if (button) {
            button.textContent =
                getMessage(
                    "days",
                    String(days),
                    `${days} days`
                );
        }
    });
}

localizeDynamicControls();

async function saveSettings() {
    await chrome.storage.local.set({
        [STORAGE_KEYS.SETTINGS]: settings
    });
}

function createHibernateWord(word, days) {
    const date = new Date();
    date.setDate(date.getDate() + days);

    return {
        text: word,
        expires: date.toISOString()
    };
}

function cleanExpiredHibernate() {
    const now = new Date();

    settings.groups.hibernated.words =
        settings.groups.hibernated.words.filter(
            item => new Date(item.expires) > now
        );
}

async function loadCurrentSite() {
    try {
        const tabs =
            await chrome.tabs.query({
                active: true,
                currentWindow: true
            });
        const tab = tabs[0];

        if (!tab?.url) {
            currentSite = "";
            currentTabId = null;
            return;
        }

        currentTabId = tab.id ?? null;

        const url = new URL(tab.url);

        if (
            url.protocol !== "http:" &&
            url.protocol !== "https:"
        ) {
            currentSite = "";
            currentTabId = null;
            return;
        }

        currentSite = normalizeSite(url.hostname);
    } catch {
        currentSite = "";
        currentTabId = null;
    }
}

async function loadSettings() {
    const data =
        await chrome.storage.local.get(
            STORAGE_KEYS.SETTINGS
        );

    settings = mergeSettings(
        data[STORAGE_KEYS.SETTINGS]
    );

    cleanExpiredHibernate();
    await saveSettings();
    await loadCurrentSite();
    render();
    await loadStatistics();
}

function createRemoveButton(onClick) {
    const remove =
        document.createElement("button");

    remove.textContent = "❌";
    remove.className = "remove";
    remove.title = getMessage(
        "removeItem",
        undefined,
        "Remove"
    );
    remove.setAttribute(
        "aria-label",
        remove.title
    );
    remove.onclick = onClick;

    return remove;
}

function parseGroupWords(value) {
    const words = [];
    const seen = new Set();

    for (const line of value.split(/\r?\n/)) {
        const word =
            line
                .trim()
                .toLocaleLowerCase(
                    getUiLanguage()
                );

        if (!word || seen.has(word)) {
            continue;
        }

        if (word.length > MAX_WORD_LENGTH) {
            return {
                error: getMessage(
                    "wordTooLong",
                    [
                        word.slice(0, 30),
                        String(MAX_WORD_LENGTH)
                    ],
                    `The phrase "${word.slice(0, 30)}..." ` +
                    `exceeds ${MAX_WORD_LENGTH} characters.`
                )
            };
        }

        seen.add(word);
        words.push(word);
    }

    if (words.length > MAX_GROUP_WORDS) {
        return {
            error: getMessage(
                "groupWordLimit",
                String(MAX_GROUP_WORDS),
                `The limit is ${MAX_GROUP_WORDS} ` +
                "words per group."
            )
        };
    }

    return { words };
}

function hasDefaultWords(name, words) {
    const defaultWords =
        parseGroupWords(
            DEFAULT_GROUPS[name]
                .words
                .join("\n")
        ).words;

    if (words.length !== defaultWords.length) {
        return false;
    }

    const currentWords = new Set(words);

    return defaultWords.every(
        word => currentWords.has(word)
    );
}

function createGroupEditor(name, group) {
    const label =
        getGroupLabel(name);

    const editor =
        document.createElement("div");

    editor.className = "group-editor";

    const state =
        document.createElement("div");

    state.className = "group-editor-state";
    state.textContent = group.customized
        ? getMessage(
            "customList",
            undefined,
            "Custom list"
        )
        : getMessage(
            "defaultList",
            undefined,
            "Default list"
        );

    const help =
        document.createElement("div");

    help.className = "group-editor-help";
    help.textContent =
        getMessage(
            "oneEntryPerLine",
            undefined,
            "One word or phrase per line."
        );

    const textarea =
        document.createElement("textarea");

    textarea.className = "group-editor-words";
    textarea.value = group.words.join("\n");
    textarea.rows = 7;
    textarea.spellcheck = false;
    textarea.setAttribute(
        "aria-label",
        getMessage(
            "groupWordsAria",
            label,
            `Words in the ${label} group`
        )
    );

    const error =
        document.createElement("div");

    error.className = "group-editor-error";
    error.setAttribute("role", "alert");

    const actions =
        document.createElement("div");

    actions.className = "group-editor-actions";

    const cancel =
        document.createElement("button");

    cancel.className = "group-editor-cancel";
    cancel.textContent = getMessage(
        "cancel",
        undefined,
        "Cancel"
    );
    cancel.addEventListener("click", () => {
        editingGroup = null;
        renderGroups();
    });

    const save =
        document.createElement("button");

    save.className = "group-editor-save";
    save.textContent = getMessage(
        "save",
        undefined,
        "Save"
    );
    save.addEventListener(
        "click",
        async () => {
            const parsed =
                parseGroupWords(textarea.value);

            if (parsed.error) {
                error.textContent = parsed.error;
                return;
            }

            if (hasDefaultWords(name, parsed.words)) {
                group.words =
                    structuredClone(
                        DEFAULT_GROUPS[name].words
                    );
                group.customized = false;
            } else {
                group.words = parsed.words;
                group.customized = true;
            }

            editingGroup = null;
            groupMessage =
                getMessage(
                    "groupSaved",
                    label,
                    `${label}: list saved. ` +
                    "Reload the page to apply."
                );

            await saveSettings();
            renderGroups();
        }
    );

    actions.append(cancel, save);

    const restore =
        document.createElement("button");

    restore.className = "group-editor-restore";
    restore.textContent =
        getMessage(
            "restoreGroupDefault",
            undefined,
            "Restore this group's default"
        );
    restore.addEventListener(
        "click",
        async () => {
            const confirmed = window.confirm(
                getMessage(
                    "groupRestoreConfirm",
                    label,
                    `Restore the default list for ${label}?`
                )
            );

            if (!confirmed) {
                return;
            }

            const enabled = group.enabled;

            settings.groups[name] = {
                ...structuredClone(
                    DEFAULT_GROUPS[name]
                ),
                enabled,
                customized: false
            };

            editingGroup = null;
            groupMessage =
                getMessage(
                    "groupRestored",
                    label,
                    `${label}: default list restored. ` +
                    "Reload the page to apply."
                );

            await saveSettings();
            renderGroups();
        }
    );

    editor.append(
        state,
        help,
        textarea,
        error,
        actions,
        restore
    );

    setTimeout(() => textarea.focus(), 0);

    return editor;
}

function renderGroups() {
    groupList.innerHTML = "";

    Object.entries(settings.groups)
        .forEach(([name, group]) => {
            const card =
                document.createElement("div");

            card.className = "group-card";

            const row =
                document.createElement("div");

            row.className = "group-row";

            const toggleLabel =
                document.createElement("label");

            toggleLabel.className =
                "group-toggle";

            const checkbox =
                document.createElement("input");

            checkbox.type = "checkbox";
            checkbox.checked = group.enabled;

            checkbox.addEventListener(
                "change",
                async () => {
                    group.enabled =
                        checkbox.checked;

                    await saveSettings();
                }
            );

            const title =
                document.createElement("span");

            title.className = "group-name";
            title.textContent =
                getGroupLabel(name);

            const count =
                document.createElement("span");

            count.className = "group-count";
            count.textContent =
                group.words.length;

            toggleLabel.append(
                checkbox,
                title
            );

            row.append(toggleLabel, count);

            if (
                EDITABLE_GROUP_NAMES
                    .includes(name)
            ) {
                const edit =
                    document.createElement("button");

                const isEditing =
                    editingGroup === name;

                edit.className = "group-edit";
                edit.textContent = "⚙";
                edit.title =
                    getMessage(
                        "editGroupAria",
                        title.textContent,
                        `Edit words in ${title.textContent}`
                    );
                edit.setAttribute(
                    "aria-label",
                    edit.title
                );
                edit.setAttribute(
                    "aria-expanded",
                    String(isEditing)
                );

                edit.addEventListener(
                    "click",
                    () => {
                        editingGroup =
                            isEditing
                                ? null
                                : name;
                        groupMessage = "";
                        renderGroups();
                    }
                );

                row.appendChild(edit);

                if (isEditing) {
                    card.classList.add(
                        "is-editing"
                    );
                }
            }

            card.appendChild(row);

            if (editingGroup === name) {
                card.appendChild(
                    createGroupEditor(
                        name,
                        group
                    )
                );
            }

            groupList.appendChild(card);
        });

    if (groupMessage) {
        const message =
            document.createElement("div");

        message.className = "group-message";
        message.textContent = groupMessage;
        message.setAttribute("role", "status");

        groupList.appendChild(message);
    }
}

function renderCustomWords() {
    wordList.innerHTML = "";

    const words =
        settings.groups.custom.words ||
        [];

    wordCount.innerText =
        ` (${words.length})`;

    words.forEach(word => {
        const li =
            document.createElement("li");

        li.textContent = word;

        li.appendChild(
            createRemoveButton(
                async () => {
                    settings.groups
                        .custom
                        .words =
                        words.filter(
                            item => item !== word
                        );

                    await saveSettings();
                    render();
                }
            )
        );

        wordList.appendChild(li);
    });
}

function renderHibernateWords() {
    if (!hibernateList) {
        return;
    }

    hibernateList.innerHTML = "";

    const words =
        settings.groups.hibernated.words ||
        [];

    hibernateCount.innerText =
        ` (${words.length})`;

    words.forEach(item => {
        const li =
            document.createElement("li");

        const wordLabel =
            document.createElement("span");
        const expirationLabel =
            document.createElement("span");
        const expirationDate =
            new Date(item.expires)
                .toLocaleDateString(
                    getUiLanguage()
                );

        wordLabel.className = "hibernateWord";
        wordLabel.textContent = item.text;
        expirationLabel.className =
            "hibernateExpire";
        expirationLabel.textContent =
            getMessage(
                "expiresOn",
                expirationDate,
                `Expires: ${expirationDate}`
            );

        li.append(wordLabel, expirationLabel);

        li.appendChild(
            createRemoveButton(
                async () => {
                    settings.groups
                        .hibernated
                        .words =
                        words.filter(
                            word =>
                                word.text !== item.text
                        );

                    await saveSettings();
                    render();
                }
            )
        );

        hibernateList.appendChild(li);
    });
}

function renderIgnoredSites() {
    if (!ignoredSitesList) {
        return;
    }

    ignoredSitesList.innerHTML = "";

    const sites =
        settings.ignoredSites || [];

    ignoredSitesCount.innerText =
        ` (${sites.length})`;

    sites
        .slice()
        .sort()
        .forEach(site => {
            const li =
                document.createElement("li");

            li.textContent = site;

            li.appendChild(
                createRemoveButton(
                    async () => {
                        settings.ignoredSites =
                            settings.ignoredSites
                                .filter(
                                    item =>
                                        item !== site
                                );

                        await saveSettings();
                        render();
                    }
                )
            );

            ignoredSitesList.appendChild(li);
        });

    if (!currentSite) {
        ignoreCurrentSiteButton.disabled = true;
        ignoreCurrentSiteButton.textContent =
            getMessage(
                "siteUnavailable",
                undefined,
                "Unavailable on this page"
            );
        return;
    }

    const alreadyIgnored =
        sites.some(site =>
            siteMatchesHostname(
                currentSite,
                site
            )
        );

    ignoreCurrentSiteButton.disabled =
        alreadyIgnored;
    ignoreCurrentSiteButton.textContent =
        alreadyIgnored
            ? getMessage(
                "siteAlreadyIgnored",
                undefined,
                "This site is already ignored"
            )
            : getMessage(
                "ignoreThisSite",
                undefined,
                "Ignore this site"
            );
}

function render() {
    toggle.checked = settings.enabled;

    const showBlockReason =
        settings.showBlockReason !== false;

    showBlockReasonToggle.checked =
        showBlockReason;

    toggleText.innerText =
        settings.enabled
            ? getMessage(
                "enabled",
                undefined,
                "Enabled"
            )
            : getMessage(
                "disabled",
                undefined,
                "Disabled"
            );

    renderGroups();
    renderCustomWords();
    renderHibernateWords();
    renderIgnoredSites();
}

async function loadStatistics() {
    const sessionData =
        await chrome.storage.session.get(
            "blockedSession"
        );

    const localData =
        await chrome.storage.local.get(
            STORAGE_KEYS.SETTINGS
        );

    blockedSession.innerText =
        sessionData.blockedSession || 0;

    blockedTotal.innerText =
        localData[
            STORAGE_KEYS.SETTINGS
        ]?.blockedTotal || 0;
}

toggle.addEventListener(
    "change",
    async () => {
        settings.enabled = toggle.checked;
        await saveSettings();
        render();
    }
);

showBlockReasonToggle.addEventListener(
    "change",
    async () => {
        settings.showBlockReason =
            showBlockReasonToggle.checked;

        await saveSettings();

        const tabs =
            await chrome.tabs.query({
                active: true,
                currentWindow: true
            });

        if (!tabs[0]?.id) {
            return;
        }

        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                action: "updateBlockReason",
                showBlockReason:
                    settings.showBlockReason
            },
            () => {
                if (chrome.runtime.lastError) {
                    console.log(
                        chrome.runtime
                            .lastError
                            .message
                    );
                }
            }
        );
    }
);

showUnfilteredPageButton.addEventListener(
    "click",
    async () => {
        const tabs =
            await chrome.tabs.query({
                active: true,
                currentWindow: true
            });

        if (!tabs[0]) {
            return;
        }

        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                action:
                    "showUnfilteredPage"
            },
            () => {
                if (chrome.runtime.lastError) {
                    console.log(
                        chrome.runtime
                            .lastError
                            .message
                    );
                }
            }
        );

        setTimeout(
            () => chrome.tabs.reload(
                tabs[0].id
            ),
            300
        );
    }
);

addButton.addEventListener(
    "click",
    async () => {
        const word =
            input.value
                .trim()
                .toLocaleLowerCase(
                    getUiLanguage()
                );

        if (!word) {
            return;
        }

        const words =
            settings.groups
                .custom
                .words;

        if (!words.includes(word)) {
            words.push(word);
        }

        input.value = "";
        await saveSettings();
        render();
    }
);

addIgnoredSiteButton.addEventListener(
    "click",
    async () => {
        let site =
            ignoredSiteInput.value
                .trim()
                .toLowerCase();

        if (!site) {
            return;
        }

        site = normalizeSite(site);

        if (!site) {
            return;
        }

        if (
            !settings.ignoredSites
                .includes(site)
        ) {
            settings.ignoredSites.push(site);
            settings.ignoredSites.sort();
        }

        ignoredSiteInput.value = "";
        await saveSettings();
        render();
    }
);

ignoreCurrentSiteButton.addEventListener(
    "click",
    async () => {
        if (!currentSite) {
            return;
        }

        if (
            !settings.ignoredSites
                .includes(currentSite)
        ) {
            settings.ignoredSites.push(
                currentSite
            );
            settings.ignoredSites.sort();
        }

        currentSiteMessage.textContent =
            getMessage(
                "siteIgnored",
                currentSite,
                `${currentSite} ignored`
            );

        await saveSettings();
        renderIgnoredSites();

        if (currentTabId !== null) {
            await chrome.tabs.reload(
                currentTabId
            );
        }
    }
);

function registerHibernate(
    buttonId,
    days
) {
    const button = $(buttonId);

    if (!button || !hibernateInput) {
        return;
    }

    button.addEventListener(
        "click",
        async () => {
            const word =
                hibernateInput.value
                    .trim()
                    .toLocaleLowerCase(
                        getUiLanguage()
                    );

            if (!word) {
                return;
            }

            settings.groups
                .hibernated
                .words
                .push(
                    createHibernateWord(
                        word,
                        days
                    )
                );

            hibernateInput.value = "";
            await saveSettings();
            render();
        }
    );
}

registerHibernate("hibernate7", 7);
registerHibernate("hibernate15", 15);
registerHibernate("hibernate30", 30);

resetButton.addEventListener(
    "click",
    async () => {
        const confirmed = window.confirm(
            getMessage(
                "restoreAllConfirm",
                undefined,
                "Restore all default lists? " +
                "Custom and hibernated words " +
                "will be preserved."
            )
        );

        if (!confirmed) {
            return;
        }

        EDITABLE_GROUP_NAMES
            .forEach(name => {
                const enabled =
                    settings.groups[name]
                        ?.enabled ?? true;

                settings.groups[name] = {
                    ...structuredClone(
                        DEFAULT_GROUPS[name]
                    ),
                    enabled,
                    customized: false
                };
            });

        editingGroup = null;
        groupMessage =
            getMessage(
                "allDefaultsRestored",
                undefined,
                "Default lists restored. " +
                "Reload the page to apply."
            );

        await saveSettings();
        render();
    }
);

loadSettings();
