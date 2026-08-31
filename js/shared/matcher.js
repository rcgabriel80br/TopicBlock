(function exposeMatcher(root) {
    function normalizeSearchText(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/\p{M}/gu, "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function escapeRegularExpression(value) {
        return value.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
    }

    function createSearchExpression(word) {
        const normalizedWord =
            normalizeSearchText(word);

        if (!normalizedWord) {
            return null;
        }

        return new RegExp(
            "(^|[^\\p{L}\\p{N}_])" +
            escapeRegularExpression(normalizedWord) +
            "(?=$|[^\\p{L}\\p{N}_])",
            "iu"
        );
    }

    function findBlockedMatch(text, entries) {
        if (!text || !Array.isArray(entries)) {
            return null;
        }

        const normalizedText =
            normalizeSearchText(text);

        for (const entry of entries) {
            if (!entry || typeof entry.word !== "string") {
                continue;
            }

            const expression =
                createSearchExpression(entry.word);

            if (
                expression &&
                expression.test(normalizedText)
            ) {
                return {
                    word: entry.word,
                    group: entry.group
                };
            }
        }

        return null;
    }

    root.TopicBlockMatcher = Object.freeze({
        createSearchExpression,
        findBlockedMatch,
        normalizeSearchText
    });
})(globalThis);
