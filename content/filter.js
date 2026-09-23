let BLOCKED_ENTRIES = [];
let TOPICBLOCK_ENABLED = true;
let SHOW_BLOCK_REASON = true;
let SHOW_UNFILTERED_PAGE = false;
const unfilteredUrl =
    sessionStorage.getItem(
        "topicblock_unfiltered_url"
    );
if (
    unfilteredUrl === location.href
) {
    SHOW_UNFILTERED_PAGE = true;
    sessionStorage.removeItem(
        "topicblock_unfiltered_url"
    );
}
else {
    sessionStorage.removeItem(
        "topicblock_unfiltered_url"
    );
}
let IGNORED_SITES = [];
let blockedThisScan = 0;
let pageBlockedCount = 0;
let DEBUG_ENABLED = false;

function updateBlockReasonVisibility(showBlockReason) {
    SHOW_BLOCK_REASON = showBlockReason;

    document.querySelectorAll(
        ".topicblock-block-reason"
    ).forEach(reason => {
        reason.hidden = !SHOW_BLOCK_REASON;
    });
}

const LEGACY_GROUP_IDS = {
    musica: "music",
    adulto: "adult",
    personalizado: "custom",
    hibernados: "hibernated"
};

const GROUP_MESSAGE_KEYS = {
    influencers: "groupInfluencers",
    music: "groupMusic",
    adult: "groupAdult",
    funk: "groupFunk",
    bbb: "groupBbb",
    custom: "groupCustom",
    hibernated: "groupHibernated"
};

function getMessage(
    key,
    substitutions,
    fallback
) {
    return chrome.i18n.getMessage(
        key,
        substitutions
    ) || fallback;
}

function getCanonicalGroupId(groupId) {
    return LEGACY_GROUP_IDS[groupId] || groupId;
}

function getGroupLabel(groupId) {
    const canonicalGroupId =
        getCanonicalGroupId(groupId);
    const messageKey =
        GROUP_MESSAGE_KEYS[canonicalGroupId];

    return messageKey
        ? getMessage(
            messageKey,
            undefined,
            canonicalGroupId
        )
        : canonicalGroupId;
}

function debugLog(...args) {
    if (DEBUG_ENABLED) {
        console.debug("[TopicBlock]", ...args);
    }
}

function updateBlockedEntries(groups) {
    BLOCKED_ENTRIES = [];
    Object.entries(groups).forEach(
        ([groupId, group]) => {
            if (
                !group.enabled ||
                !Array.isArray(group.words)
            ) {
                return;
            }

            group.words.forEach(item => {
                // Add regular group entries.
                if (
                    typeof item === "string"
                ) {
                    BLOCKED_ENTRIES.push({
                        word: item,
                        group:
                            getCanonicalGroupId(
                                groupId
                            )
                    });
                    return;
                }

                // Add active hibernated entries.
                if (
                    item && item.text &&
                    item.expires
                ) {
                    const expiration =
                        new Date(item.expires);
                    const now = new Date();

                    if (expiration > now) {
                        BLOCKED_ENTRIES.push({
                            word: item.text,
                            group:
                                getCanonicalGroupId(
                                    groupId
                                )
                        });
                    }
                }
            });
        }
    );
}
let filterSettings = {};
let filterSignature = null;
let settingsRevision = 0;
let expirationTimer = null;

function applyFilterSettings(settings = {}, refresh = true) {
    filterSettings = settings;
    const signature = JSON.stringify([
        settings.enabled !== false,
        settings.groups || {},
        settings.ignoredSites || []
    ]);
    const rulesChanged = signature !== filterSignature;
    filterSignature = signature;
    DEBUG_ENABLED = Boolean(settings.debug);
    TOPICBLOCK_ENABLED = settings.enabled !== false;
    IGNORED_SITES = settings.ignoredSites || [];
    updateBlockedEntries(settings.groups || {});
    updateBlockReasonVisibility(settings.showBlockReason !== false);
    scheduleExpiration();
    if (refresh && rulesChanged) {
        refreshPageFilters();
    }
}

function scheduleExpiration() {
    clearTimeout(expirationTimer);
    const now = Date.now();
    const expirations = Object.values(filterSettings.groups || {})
        .filter(group => group.enabled)
        .flatMap(group => group.words || [])
        .filter(item => item && typeof item === "object")
        .map(item => new Date(item.expires).getTime())
        .filter(time => time > now);
    if (!expirations.length) return;
    // Browser timers have a signed 32-bit delay limit (less than 30 days).
    expirationTimer = setTimeout(() => {
        updateBlockedEntries(filterSettings.groups || {});
        refreshPageFilters();
        scheduleExpiration();
    }, Math.min(Math.min(...expirations) - now, 2147483647));
}

async function loadFilterSettings() {
    const revision = settingsRevision;
    try {
        const data = await chrome.storage.local.get("topicblock_settings");
        // A storage event may arrive while this initial read is pending.
        if (revision === settingsRevision) {
            applyFilterSettings(data.topicblock_settings || {}, false);
        }
    } catch (error) {
        console.error("[TopicBlock] Failed to load settings:", error);
    }
}

function restoreTopic(element, manuallyRevealed = false) {
    if (!element._topicblockOriginalNodes) return;
    element._topicblockGuardObserver?.disconnect();
    delete element._topicblockGuardObserver;
    delete element.dataset.topicblockLocked;
    element.replaceChildren(...element._topicblockOriginalNodes);
    element.classList.remove("topicblock-blocked");
    delete element.dataset.topicblockHidden;
    for (const [attribute, value] of [
        ["style", element._topicblockOriginalStyle],
        ["title", element._topicblockOriginalTitle]
    ]) {
        if (value === null) element.removeAttribute(attribute);
        else element.setAttribute(attribute, value);
    }
    if (manuallyRevealed) {
        element.dataset.topicblockExcluded = "1";
    }
    // Keep the counted marker so toggling rules cannot inflate statistics.
    delete element._topicblockOriginalNodes;
    delete element._topicblockOriginalStyle;
    delete element._topicblockOriginalTitle;
}

function refreshPageFilters() {
    window.topicBlockUpdating = true;
    try {
        document.querySelectorAll("[data-topicblock-hidden='1']")
            .forEach(element => restoreTopic(element));
        scanPage();
    } finally {
        window.topicBlockUpdating = false;
    }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes.topicblock_settings) return;
    settingsRevision++;
    applyFilterSettings(changes.topicblock_settings.newValue || {});
});

function findBlockedWord(text) {
    const match =
        globalThis.TopicBlockMatcher
            .findBlockedMatch(
                text,
                BLOCKED_ENTRIES
            );

    if (match) {
        debugLog(
            "Matched entry:",
            match
        );
    }

    return match;
}
function hideTopic(element, match) {
    if (!element) return;

    if (
        element.dataset.topicblockLocked === "1"
    ) {
        debugLog("Element is already locked.");
        return;
    }

    // Skip elements already processed by TopicBlock.
    if (
        element.dataset.topicblockHidden === "1" ||
        element.classList.contains("topicblock-blocked")
    ) {
        debugLog("Element is already blocked.");
        return;
    }

    if (
        element.tagName === "BODY" ||
        element.tagName === "HTML"
    ) {
        console.warn(
            "[TopicBlock] Refused to block the entire page."
        );
        return;
    }

    window.topicBlockUpdating = true;
    let label = null;

    try {
        // Retain the actual nodes, including site event listeners and form state.
        element._topicblockOriginalNodes = Array.from(element.childNodes);
        element._topicblockOriginalStyle = element.getAttribute("style");
        element._topicblockOriginalTitle = element.getAttribute("title");
        element.dataset.topicblockLocked = "1";
        element.replaceChildren();
        element.dataset.topicblockHidden = "1";
        element.classList.add(
            "topicblock-blocked"
        );

        if (element.title) {
            element.title = getMessage(
                "blockedContentTitle",
                undefined,
                "Blocked content"
            );
        }

        element.style.background = "#d9d9d9";
        element.style.color = "transparent";
        element.style.border = "1px solid #bfbfbf";
        element.style.borderRadius = "8px";
        element.style.minHeight = "180px";
        element.style.position = "relative";
        element.style.overflow = "hidden";

        label = document.createElement("div");
        const title = document.createElement("div");
        const showLink = document.createElement("div");

        title.textContent = "TopicBlock";
        title.style.fontWeight = "bold";
        showLink.className =
            "topicblock-show-content";
        showLink.textContent = getMessage(
            "showBlockedContent",
            undefined,
            "Show blocked content"
        );

        label.append(title, showLink);

        if (match) {
            const reason =
                document.createElement("div");
            const groupLabel =
                getGroupLabel(match.group);

            reason.className =
                "topicblock-block-reason";
            reason.hidden = !SHOW_BLOCK_REASON;
            reason.textContent = getMessage(
                "blockedReason",
                [match.word, groupLabel],
                `Blocked by: "${match.word}" — ${groupLabel}`
            );
            reason.style.marginTop = "7px";
            reason.style.fontSize = "10px";
            reason.style.fontWeight = "normal";
            reason.style.color = "#777";
            reason.style.lineHeight = "1.3";
            reason.style.whiteSpace = "normal";

            label.appendChild(reason);
        }

        label.style.position = "absolute";
        label.style.top = "50%";
        label.style.left = "50%";
        label.style.transform = "translate(-50%, -50%)";
        label.style.visibility = "visible";
        label.style.color = "#555";
        label.style.fontWeight = "bold";
        label.style.fontSize = "16px";
        label.style.textAlign = "center";
        label.style.width = "90%";
        label.style.zIndex = "999999";
        showLink.style.marginTop = "6px";
        showLink.style.fontSize = "11px";
        showLink.style.fontWeight = "normal";
        showLink.style.cursor = "pointer";
        showLink.style.textDecoration = "none";
        showLink.style.color = "#888";
        showLink.onclick = (event) => {
            event.stopPropagation();
            event.preventDefault();
            restoreTopic(element, true);
        };
        showLink.onmouseenter = () => {
            showLink.style.textDecoration = "underline";
            showLink.style.color = "#555";
        };
        showLink.onmouseleave = () => {
            showLink.style.textDecoration = "none";
            showLink.style.color = "#888";
        };
        element.appendChild(label);
        if (
            !element.dataset.topicblockCounted
        ) {
            element.dataset.topicblockCounted = "1";
            blockedThisScan++;
        }
    }
    finally {
        window.topicBlockUpdating = false;

        const guardObserver = new MutationObserver(() => {
            if (
                element.dataset.topicblockLocked !== "1"
            ) {
                guardObserver.disconnect();
                return;
            }
            if (
                !element.classList.contains(
                    "topicblock-blocked"
                )
            ) {
                element.classList.add(
                    "topicblock-blocked"
                );
            }
            if (
                element.querySelector(
                    ".topicblock-show-content"
                )
            ) {
                return;
            }
            if (!label) {
                return;
            }
            label.style.position = "absolute";
            label.style.top = "50%";
            label.style.left = "50%";
            label.style.transform =
                "translate(-50%, -50%)";
            label.style.color = "#555";
            element.appendChild(label);
        });

        element._topicblockGuardObserver = guardObserver;
        guardObserver.observe(element, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"]
        });
    }
}
function getContainer(topic) {
    let element = topic;

    // Prefer known WordPress news card containers.
    const postCard =
        topic.closest(
            ".fl-post-grid-post, .fl-post-feed-post"
        );
    if (postCard) {
        return postCard;
    }

    // Prefer the individual related-video card on Terra.
    const terraRelatedVideo =
        topic.closest(
            ".related-videos__content--center"
        );

    if (terraRelatedVideo) {
        return terraRelatedVideo;
    }

    for (let i = 0; i < 10; i++) {
        element = element.parentElement;
        if (!element) {
            return null;
        }
        const tag = element.tagName;
        if (
            tag === "MAIN" ||
            tag === "BODY" ||
            tag === "HTML"
        ) {
            return null;
        }
        if (tag === "ARTICLE") {
            return element;
        }
        if (tag === "LI") {
            const idClass =
                (
                    (element.id || "") +
                    " " +
                    (element.className || "")
                ).toLowerCase();
            if (
                idClass.includes("showcase")
            ) {
                return element;
            }
            const textLength =
                (element.innerText || "").length;
            if (
                textLength >= 50 &&
                textLength <= 800
            ) {
                return element;
            }
        }
        if (tag === "DIV") {
            const idClass =
                (
                    (element.id || "") +
                    " " +
                    (element.className || "")
                ).toLowerCase();
            if (
                idClass.includes("fl-post-feed-post") ||
                idClass.includes("fl-post-grid-post")
            ) {
                return element;
            }
            if (
                idClass.includes("module")
            ) {
                // Module containers are too broad on multi-column portals.
                continue;
            }
            if (
                idClass.includes("main-content") ||
                idClass.includes("content-wrapper") ||
                idClass.includes("container") ||
                idClass.includes("layout") ||
                idClass.includes("footer") ||
                idClass.includes("header") ||
                idClass.includes("menu") ||
                idClass.includes("copyright")
            ) {
                continue;
            }
            const children =
                element.children.length;
            const textLength =
                (element.innerText || "").length;

            if (
                children <= 8 &&
                textLength >= 50 &&
                textLength <= 800 &&
                !idClass.includes("list") &&
                !idClass.includes("grid") &&
                !idClass.includes("section") &&
                !idClass.includes("nav") &&
                !idClass.includes("breadcrumb") &&
                !idClass.includes("related")
            ) {
                return element;
            }
        }
    }
    return null;
}
function scanPage() {
    debugLog(
        "Scanning page at",
        new Date().toLocaleTimeString()
    );
    blockedThisScan = 0;
    const host =
        window.location.hostname.toLowerCase();
    const ignored =
        IGNORED_SITES.some(site =>
            globalThis.TopicBlockSites
                .siteMatchesHostname(
                    host,
                    site
                )
        );
    if (ignored) {
        debugLog(
            "Ignored site:",
            host
        );
        return;
    }
    debugLog(
        "Filter enabled:",
        TOPICBLOCK_ENABLED
    );
    if (
        !TOPICBLOCK_ENABLED ||
        SHOW_UNFILTERED_PAGE
    ) {
        debugLog("Filter bypassed on this page.");
        return;
    }
    const topics =
        document.querySelectorAll(
            "a, h1, h2, h3, span"
        );
    topics.forEach(topic => {
        if (
            !document.body.contains(topic)
        ) {
            return;
        }
        if (
            topic.closest(".topicblock-blocked") ||
            topic.closest("[data-topicblock-hidden='1']") ||
            topic.dataset.topicblockChild === "1"
        ) {
            return;
        }
        const text =
            topic.innerText ||
            topic.textContent ||
            "";
        const match = findBlockedWord(text);

        if (!match) {
            return;
        }
        debugLog(
            "Blocked text found:",
            text
        );
        const container =
            getContainer(topic);
        debugLog(
            "Selected container:",
            container
        );
        if (
            container &&
            (
                container.dataset.topicblockExcluded === "1" ||
                container.closest("[data-topicblock-excluded='1']")
            )
        ) {
            debugLog("Content was manually revealed.");
            return;
        }
        if (!container) {
            debugLog(
                "No container found for:",
                text
            );
            return;
        }
        if (
            container.classList.contains("topicblock-blocked")
        ) {
            debugLog("Container is already blocked.");
            return;
        }
        hideTopic(container, match);
    });
    // Only newly hidden cards are counted during this scan.
    const newBlocked = blockedThisScan;
    if (newBlocked > 0) {
        chrome.runtime.sendMessage({
            action: "incrementBlockedTotal",
            amount: newBlocked
        });
        pageBlockedCount += newBlocked;
    }
    debugLog(
        "Blocked on this page:",
        pageBlockedCount
    );
}
loadFilterSettings()
    .then(() => {
        window.scanPage = scanPage;
        debugLog(
            "Filter ready:",
            BLOCKED_ENTRIES.length,
            BLOCKED_ENTRIES
        );
        window.dispatchEvent(
            new Event("topicblock-ready")
        );
    });
chrome.runtime.onMessage.addListener(
    (message) => {
        debugLog(
            "Message received:",
            message
        );
        if (
            message.action === "updateStatus"
        ) {
            TOPICBLOCK_ENABLED =
                message.enabled;
            refreshPageFilters();
            debugLog(
                "Status updated:",
                TOPICBLOCK_ENABLED
            );
        }
        if (
            message.action === "updateFilterMode"
        ) {
            SHOW_UNFILTERED_PAGE =
                message.showUnfilteredPage;
            refreshPageFilters();
            debugLog(
                "Unfiltered page:",
                SHOW_UNFILTERED_PAGE
            );
        }
        if (
            message.action === "updateBlockReason"
        ) {
            updateBlockReasonVisibility(
                message.showBlockReason !== false
            );
        }
        if (
            message.action === "showUnfilteredPage"
        ) {
            sessionStorage.setItem(
                "topicblock_unfiltered_url",
                location.href
            );
            SHOW_UNFILTERED_PAGE = true;
        }
    }
);
