document.addEventListener(
    "click",
    event => {
        const showLink =
            event.target.closest(
                ".topicblock-show-content"
            );

        if (!showLink) {
            return;
        }

        const blockedElement =
            showLink.closest(
                "[data-topicblock-hidden='1']"
            );

        if (!blockedElement) {
            return;
        }

        setTimeout(() => {
            if (
                blockedElement.dataset.topicblockExcluded !== "1" ||
                blockedElement.classList.contains(
                    "topicblock-blocked"
                )
            ) {
                return;
            }

            blockedElement.dataset.topicblockRevealed = "1";
            blockedElement.style.backgroundColor = "yellow";
        }, 0);
    },
    true
);
