import {
    DEFAULT_GROUPS,
    EDITABLE_GROUP_NAMES,
    GROUP_LABELS,
    STORAGE_KEYS
} from "../js/core/constants.js";

import {
    mergeSettings
} from "../js/core/settings.js";

const $ = id => document.getElementById(id);

const toggle = $("toggle");
const toggleText = $("toggleText");
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
const blockedSession = $("blockedSession");
const blockedTotal = $("blockedTotal");

const MAX_GROUP_WORDS = 250;
const MAX_WORD_LENGTH = 80;

let settings = mergeSettings();
let editingGroup = null;
let groupMessage = "";

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

    settings.groups.hibernados.words =
        settings.groups.hibernados.words.filter(
            item => new Date(item.expires) > now
        );
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
    render();
    await loadStatistics();
}

function createRemoveButton(onClick) {
    const remove =
        document.createElement("button");

    remove.textContent = "❌";
    remove.className = "remove";
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
                .toLocaleLowerCase("pt-BR");

        if (!word || seen.has(word)) {
            continue;
        }

        if (word.length > MAX_WORD_LENGTH) {
            return {
                error:
                    `A expressão "${word.slice(0, 30)}..." ` +
                    `ultrapassa ${MAX_WORD_LENGTH} caracteres.`
            };
        }

        seen.add(word);
        words.push(word);
    }

    if (words.length > MAX_GROUP_WORDS) {
        return {
            error:
                `O limite é de ${MAX_GROUP_WORDS} ` +
                "palavras por grupo."
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
        GROUP_LABELS[name] || name;

    const editor =
        document.createElement("div");

    editor.className = "group-editor";

    const state =
        document.createElement("div");

    state.className = "group-editor-state";
    state.textContent = group.customized
        ? "Lista personalizada"
        : "Lista padrão";

    const help =
        document.createElement("div");

    help.className = "group-editor-help";
    help.textContent =
        "Uma palavra ou expressão por linha.";

    const textarea =
        document.createElement("textarea");

    textarea.className = "group-editor-words";
    textarea.value = group.words.join("\n");
    textarea.rows = 7;
    textarea.spellcheck = false;
    textarea.setAttribute(
        "aria-label",
        `Palavras do grupo ${label}`
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
    cancel.textContent = "Cancelar";
    cancel.addEventListener("click", () => {
        editingGroup = null;
        renderGroups();
    });

    const save =
        document.createElement("button");

    save.className = "group-editor-save";
    save.textContent = "Salvar";
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
                `${label}: lista salva. ` +
                "Recarregue a página para aplicar.";

            await saveSettings();
            renderGroups();
        }
    );

    actions.append(cancel, save);

    const restore =
        document.createElement("button");

    restore.className = "group-editor-restore";
    restore.textContent =
        "Restaurar padrão deste grupo";
    restore.addEventListener(
        "click",
        async () => {
            const confirmed = window.confirm(
                `Restaurar a lista padrão de ${label}?`
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
                `${label}: lista padrão restaurada. ` +
                "Recarregue a página para aplicar.";

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
                GROUP_LABELS[name] || name;

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
                    `Editar palavras de ${title.textContent}`;
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
        settings.groups.personalizado.words ||
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
                        .personalizado
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
        settings.groups.hibernados.words ||
        [];

    hibernateCount.innerText =
        ` (${words.length})`;

    words.forEach(item => {
        const li =
            document.createElement("li");

        li.innerHTML =
            `${item.text}
             <span> - Expira: ${
                 new Date(item.expires)
                     .toLocaleDateString("pt-BR")
             }</span>`;

        li.appendChild(
            createRemoveButton(
                async () => {
                    settings.groups
                        .hibernados
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
}

function render() {
    toggle.checked = settings.enabled;

    toggleText.innerText =
        settings.enabled
            ? "Ativado"
            : "Desativado";

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
                .toLowerCase();

        if (!word) {
            return;
        }

        const words =
            settings.groups
                .personalizado
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

        site = site
            .replace(/^https?:\/\//, "")
            .replace(/\/.*$/, "");

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
                    .toLowerCase();

            if (!word) {
                return;
            }

            settings.groups
                .hibernados
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
            "Restaurar todas as listas padrão? " +
            "Palavras personalizadas e hibernadas " +
            "serão preservadas."
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
            "Listas padrão restauradas. " +
            "Recarregue a página para aplicar.";

        await saveSettings();
        render();
    }
);

loadSettings();
