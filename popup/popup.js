import {
    DEFAULT_GROUPS,
    GROUP_LABELS,
    STORAGE_KEYS
} from "../js/core/constants.js";

import {
    DEFAULT_SETTINGS
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

let settings =
    structuredClone(DEFAULT_SETTINGS);

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

    settings = {
        ...settings,
        ...(data[STORAGE_KEYS.SETTINGS] || {})
    };

    if (!settings.groups) {
        settings.groups =
            structuredClone(DEFAULT_GROUPS);
    }

    if (!settings.groups.hibernados) {
        settings.groups.hibernados = {
            enabled: true,
            words: []
        };
    }

    if (!Array.isArray(settings.ignoredSites)) {
        settings.ignoredSites =
            structuredClone(
                DEFAULT_SETTINGS.ignoredSites
            );
    }

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

function renderGroups() {
    groupList.innerHTML = "";

    Object.entries(settings.groups)
        .forEach(([name, group]) => {
            const card =
                document.createElement("div");

            card.className = "group-card";

            const row =
                document.createElement("label");

            row.className = "group-row";

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

            row.append(
                checkbox,
                title,
                count
            );

            card.appendChild(row);
            groupList.appendChild(card);
        });
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
        settings.groups =
            structuredClone(DEFAULT_GROUPS);

        await saveSettings();
        render();
    }
);

loadSettings();
