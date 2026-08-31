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
let totalBlocked = 0;
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
                    item.text &&
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
async function loadFilterSettings() {
    try {
        const data =
            await chrome.storage.local.get(
                "topicblock_settings"
            );
        if (data.topicblock_settings) {
            const settings =
                data.topicblock_settings;
            DEBUG_ENABLED = Boolean(
                settings.debug
            );
            SHOW_BLOCK_REASON =
                settings.showBlockReason !== false;
            if (settings.groups) {
                updateBlockedEntries(
                    settings.groups
                );
            }
            if (
                typeof settings.enabled === "boolean"
            ) {
                TOPICBLOCK_ENABLED =
                    settings.enabled;
            }
            if (settings.debug) {
                debugLog(
                    "Unfiltered page:",
                    SHOW_UNFILTERED_PAGE
                );
            }
            if (Array.isArray(settings.ignoredSites)) {
                IGNORED_SITES =
                    settings.ignoredSites;
            }
        }
    } catch (error) {
        console.error(
            "[TopicBlock] Failed to load settings:",
            error
        );
    }
}
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
        element._topicblockOriginalHTML =
            element.innerHTML;
        element._topicblockOriginalStyle =
            element.getAttribute("style") || "";
        element.dataset.topicblockLocked = "1";
        element.innerHTML = "";
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
            element.dataset.topicblockExcluded = "1";

            if (!element._topicblockOriginalHTML) {
                console.warn(
                    "[TopicBlock] Original content was not found."
                );
                return;
            }

            element._topicblockGuardObserver?.disconnect();
            delete element._topicblockGuardObserver;
            delete element.dataset.topicblockLocked;

            // Restore the original HTML.
            element.replaceChildren();
            const temp =
                document.createElement("div");
            temp.innerHTML =
                element._topicblockOriginalHTML;
            while (temp.firstChild) {
                element.appendChild(
                    temp.firstChild
                );
            }
            element.querySelectorAll("*").forEach(child => {
                child.dataset.topicblockExcluded = "1";
            });
            // Remove TopicBlock markers.
            delete element.dataset.topicblockHidden;
            element.classList.remove(
                "topicblock-blocked"
            );
            if (element._topicblockOriginalStyle) {
                element.setAttribute(
                    "style",
                    element._topicblockOriginalStyle
                );
            } else {
                element.removeAttribute(
                    "style"
                );
            }
            // Release stored content after restoration.
            delete element._topicblockOriginalHTML;
            delete element._topicblockOriginalStyle;
            delete element.dataset.topicblockCounted;
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
            totalBlocked++;
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
    totalBlocked = 0;
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
    const newBlocked =
        totalBlocked - pageBlockedCount;
    if (newBlocked > 0) {
        chrome.runtime.sendMessage({
            action: "incrementBlockedTotal",
            amount: newBlocked
        });
        pageBlockedCount = totalBlocked;
    }
    debugLog(
        "Blocked on this page:",
        totalBlocked
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
