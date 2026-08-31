export function getMessage(
    key,
    substitutions,
    fallback = key
) {
    const translated =
        chrome.i18n.getMessage(
            key,
            substitutions
        );

    return translated || fallback;
}

export function getUiLanguage() {
    return chrome.i18n.getUILanguage() || "en";
}

export function localizeDocument(root = document) {
    root.documentElement.lang = getUiLanguage();

    root.querySelectorAll("[data-i18n]")
        .forEach(element => {
            element.textContent =
                getMessage(
                    element.dataset.i18n,
                    undefined,
                    element.textContent
                );
        });

    root.querySelectorAll("[data-i18n-placeholder]")
        .forEach(element => {
            element.placeholder =
                getMessage(
                    element.dataset.i18nPlaceholder,
                    undefined,
                    element.placeholder
                );
        });
}
