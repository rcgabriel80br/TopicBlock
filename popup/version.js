const versionElement = document.getElementById("extensionVersion");

if (versionElement) {
    versionElement.textContent =
        `v${chrome.runtime.getManifest().version}`;
}
