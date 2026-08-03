let BLOCKED_WORDS = [];
let TOPICBLOCK_ENABLED = true;
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
    console.log(
        "[TopicBlock] Página liberada para:",
        location.href
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
function updateBlockedWords(groups) {
    BLOCKED_WORDS = [];
    Object.values(groups).forEach(group => {
        if (
            !group.enabled ||
            !Array.isArray(group.words)
        ) {
            return;
        }
        group.words.forEach(item => {
            // grupos normais
            if (
                typeof item === "string"
            ) {
                BLOCKED_WORDS.push(item);
                return;
            }
            // grupo hibernados
            if (
                item.text &&
                item.expires
            ) {
                const expiration =
                    new Date(item.expires);
                const now =
                    new Date();
                if (
                    expiration > now
                ) {
                    BLOCKED_WORDS.push(
                        item.text
                    );
                }
            }
        });
    });
}
async function loadBlockedWords() {
    try {
        const data =
            await chrome.storage.local.get(
                "topicblock_settings"
            );
        if (data.topicblock_settings) {
            const settings =
                data.topicblock_settings;
            if (settings.groups) {
                updateBlockedWords(
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
                console.log(
                    "[TopicBlock] Página sem filtros:",
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
            "[TopicBlock] Erro ao carregar configuração:",
            error
        );
    }
}
function containsBlockedWord(text) {
    if (!text) return false;
    const normalized =
        text.toLowerCase();
    const found =
        BLOCKED_WORDS.find(word => {
            const search =
                word.toLowerCase();
            const regex =
                new RegExp(
                    "\\b" +
                    search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
                    "\\b",
                    "i"
                );
            return regex.test(normalized);
        });
    if (found) {
        console.log(
            "[TopicBlock] Palavra responsável:",
            found
        );
        return true;
    }
    return false;
}
function hideTopic(element) {
    element.style.border = "10px solid red";
    element.style.background = "yellow";
    element.style.opacity = "1";
    if (
        element.dataset.topicblockLocked === "1"
    ) {
        console.log(
            "[TopicBlock] BLOQUEIO DUPLO IGNORADO",
            element
        );
        return;
    }
    console.trace(
        "[TopicBlock] Tentando bloquear",
        element
    );
    console.log(
        "[TopicBlock IDENTIDADE]",
        {
            element,
            html: element.outerHTML.substring(0, 100),
            time: Date.now()
        }
    );
    if (!element) return;
    if (
        element.dataset.topicblockLocked === "1"
    ) {
        console.log(
            "[TopicBlock] Elemento protegido contra re-render"
        );
        return;
    }
    // ignora elementos já processados pelo TopicBlock
    if (
        element.dataset.topicblockHidden === "1" ||
        element.classList.contains("topicblock-blocked")
    ) {
        console.log(
            "[TopicBlock] Elemento já bloqueado, ignorando"
        );
        return;
    }
    if (
        element.tagName === "BODY" ||
        element.tagName === "HTML"
    ) {
        console.warn(
            "[TopicBlock] Tentativa de bloquear página inteira"
        );
        return;
    }
    window.topicBlockUpdating = true;
    let label = null;
    try {
        element._topicblockOriginalHTML =
            element.innerHTML;
        element.dataset.topicblockLocked = "1";
        element.innerHTML = "";
        setTimeout(() => {
            console.log(
                "[TESTE 500ms]",
                element.innerHTML.length
            );
        }, 500);
        console.log(
            "[TopicBlock TESTE] Depois de limpar:",
            element.innerHTML,
            element.children.length
        );
        element.dataset.topicblockHidden = "1";
        element.classList.add(
            "topicblock-blocked"
        );
        console.trace(
            "[TopicBlock] BLOQUEIO APLICADO",
            element
        );
        console.log(
            "[TopicBlock DEBUG] hideTopic aplicado:",
            {
                tag: element.tagName,
                classe: element.className,
                textoOriginal: element._topicblockOriginalHTML?.substring(0, 150),
                horario: new Date().toISOString()
            }
        );
        if (element.title) {
            element.title = "Conteúdo bloqueado";
        }
        element.querySelectorAll("img").forEach(img => {
            const width =
                img.clientWidth ||
                img.width ||
                300;
            const height =
                img.clientHeight ||
                img.height ||
                180;
            const svg = `
        <svg xmlns="http://www.w3.org/2000/svg"
             width="${width}"
             height="${height}">
            <rect width="100%"
                  height="100%"
                  fill="#d9d9d9"/>
            <text x="50%"
                  y="50%"
                  dominant-baseline="middle"
                  text-anchor="middle"
                  fill="#666"
                  font-family="Arial"
                  font-size="16">
                Conteúdo bloqueado
            </text>
        </svg>
        `;
            img.src =
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(svg);
            img.alt = "Conteúdo bloqueado";
            img.title = "Conteúdo bloqueado";
            img.style.objectFit = "cover";
        });
        element.querySelectorAll("[title]").forEach(child => {
            child.title = "Conteúdo bloqueado";
        });
        element._topicblockOriginalStyle =
            element.getAttribute("style") || "";
        element.style.background = "#d9d9d9";
        element.style.color = "transparent";
        element.style.border = "1px solid #bfbfbf";
        element.style.borderRadius = "8px";
        element.style.minHeight = "180px";
        element.style.position = "relative";
        element.style.overflow = "hidden";
        element.querySelectorAll("*").forEach(child => {
            if (child.tagName !== "IMG") {
                child.style.visibility = "hidden";
            }
        });
        label = document.createElement("div");
        label.innerHTML = `
    <div style="font-weight:bold;">
        TopicBlock
    </div>
    <div class="topicblock-show-content">
        Exibir conteúdo bloqueado
    </div>
`;
        label.style.position = "absolute";
        label.style.top = "50%";
        label.style.left = "50%";
        label.style.transform = "translate(-50%, -50%)";
        label.style.visibility = "visible";
        label.style.color = "#555";
        label.style.fontWeight = "bold";
        label.style.fontSize = "16px";
        label.style.zIndex = "999999";
        const showLink =
            label.querySelector(".topicblock-show-content");
        showLink.style.marginTop = "6px";
        showLink.style.fontSize = "11px";
        showLink.style.fontWeight = "normal";
        showLink.style.cursor = "pointer";
        showLink.style.textDecoration = "none";
        showLink.style.color = "#888";
        showLink.onclick = (event) => {
            event.stopPropagation();
            element.dataset.topicblockExcluded = "1";
            console.log(
                "[TopicBlock] Restaurando conteúdo"
            );
            if (!element._topicblockOriginalHTML) {
                console.warn(
                    "[TopicBlock] Conteúdo original não encontrado"
                );
                return;
            }
            // restaura HTML original
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
            // remove marcação do TopicBlock
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
            // limpa memória
            delete element._topicblockOriginalHTML;
            delete element.dataset.topicblockCounted;
            console.log(
                "[TopicBlock] Conteúdo restaurado"
            );
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
        console.log(
            "[TopicBlock] Finalizou bloqueio",
            element.dataset.topicblockHidden,
            element.className
        );
        //espiao
        const debugObserver = new MutationObserver((mutations) => {
            if (
                element.dataset.topicblockLocked !== "1"
            ) {
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
        debugObserver.observe(element, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true,
            characterData: true
        });
    }
}
function getContainer(topic) {
    console.log(
        "[TopicBlock] Analisando container de:",
        topic.innerText,
        topic
    );
    let element = topic;
    // prioridade para cards de notícias WordPress / grids
    const postCard =
        topic.closest(
            ".fl-post-grid-post, .fl-post-feed-post"
        );
    if (postCard) {
        return postCard;
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
                //return element; ok para bandab
                continue; //ok para globo
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
            //            if (
            //                children <= 20 &&
            //                textLength >= 50 &&
            //                textLength <= 2500
            //            ) {
            //
            //                return element;
            //            }
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
    console.log(
        "[TopicBlock] scanPage()",
        new Date().toLocaleTimeString()
    );
    totalBlocked = 0;
    const host =
        window.location.hostname.toLowerCase();
    const ignored =
        IGNORED_SITES.some(site =>
            host === site ||
            host.endsWith("." + site)
        );
    if (ignored) {
        console.log(
            "[TopicBlock] Site ignorado:",
            host
        );
        return;
    }
    console.log(
        "[TopicBlock] scanPage executado. Status:",
        TOPICBLOCK_ENABLED
    );
    if (
        !TOPICBLOCK_ENABLED ||
        SHOW_UNFILTERED_PAGE
    ) {
        console.log(
            "[TopicBlock] Filtro ignorado nesta página"
        );
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
        if (!containsBlockedWord(text)) {
            return;
        }
        console.log(
            "[TopicBlock] Palavra encontrada:",
            text
        );
        const container =
            getContainer(topic);
        console.log(
            "[TopicBlock] Container:",
            container
        );
        if (
            container &&
            (
                container.dataset.topicblockExcluded === "1" ||
                container.closest("[data-topicblock-excluded='1']")
            )
        ) {
            console.log(
                "[TopicBlock] Conteúdo liberado manualmente"
            );
            return;
        }
        if (!container) {
            console.log(
                "[TopicBlock] Container não identificado para:",
                text
            );
            return;
        }
        if (
            container.classList.contains("topicblock-blocked")
        ) {
            console.log(
                "[TopicBlock] Container já bloqueado"
            );
            return;
        }
        hideTopic(container);
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
    console.log(
        "[TopicBlock] Bloqueados nesta página:",
        totalBlocked
    );
}
loadBlockedWords()
    .then(() => {
        window.scanPage = scanPage;
        console.log(
            "[TopicBlock] Filtro pronto",
            BLOCKED_WORDS.length,
            BLOCKED_WORDS
        );
        window.topicblockDebug = {
            words: () => BLOCKED_WORDS,
            groups: () => BLOCKED_WORDS.length,
            enabled: () => TOPICBLOCK_ENABLED
        };
        window.dispatchEvent(
            new Event("topicblock-ready")
        );
    });
chrome.runtime.onMessage.addListener(
    (message) => {
        console.log(
            "[TopicBlock] Mensagem recebida:",
            message
        );
        if (
            message.action === "updateStatus"
        ) {
            TOPICBLOCK_ENABLED =
                message.enabled;
            console.log(
                "[TopicBlock] Status atualizado:",
                TOPICBLOCK_ENABLED
            );
        }
        if (
            message.action === "updateFilterMode"
        ) {
            SHOW_UNFILTERED_PAGE =
                message.showUnfilteredPage;
            console.log(
                "[TopicBlock] Página sem filtros:",
                SHOW_UNFILTERED_PAGE
            );
        }
        if (
            message.action === "showUnfilteredPage"
        ) {
            console.log(
                "[TopicBlock] Recebi comando para liberar página"
            );
            sessionStorage.setItem(
                "topicblock_unfiltered_url",
                location.href
            );
            SHOW_UNFILTERED_PAGE = true;
            console.log(
                "[TopicBlock] Página atual liberada sem filtros"
            );
        }
    }
);
chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (
            message.action === "debugWords"
        ) {
            sendResponse({
                words: BLOCKED_WORDS,
                count: BLOCKED_WORDS.length,
                enabled: TOPICBLOCK_ENABLED
            });
        }
    }
);