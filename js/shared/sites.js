(function exposeSiteUtilities(root) {
    function normalizeSite(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, "")
            .replace(/\/.*$/, "")
            .replace(/:\d+$/, "")
            .replace(/^www\./, "")
            .replace(/^\.+|\.+$/g, "");
    }

    function siteMatchesHostname(hostname, site) {
        const normalizedHostname =
            normalizeSite(hostname);
        const normalizedSite =
            normalizeSite(site);

        return Boolean(
            normalizedHostname &&
            normalizedSite &&
            (
                normalizedHostname === normalizedSite ||
                normalizedHostname.endsWith(
                    "." + normalizedSite
                )
            )
        );
    }

    root.TopicBlockSites = Object.freeze({
        normalizeSite,
        siteMatchesHostname
    });
})(globalThis);
