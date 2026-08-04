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
                blockedElement.dataset.topicblockExcluded !== "1"
            ) {
                return;
            }

            delete blockedElement.dataset.topicblockLocked;

            blockedElement.classList.remove(
                "topicblock-blocked"
            );

            const restoredLabel =
                blockedElement.querySelector(
                    ".topicblock-show-content"
                )?.parentElement;

            restoredLabel?.remove();

            blockedElement.dataset.topicblockRevealed = "1";
            blockedElement.style.backgroundColor = "yellow";
        }, 0);
    },
    true
);
