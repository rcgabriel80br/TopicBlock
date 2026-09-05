class Observer {
    constructor(callback) {
        this.callback = callback;
        this.observer = null;
        this.timer = null;
    }

    start() {
        if (this.observer) {
            return;
        }

        this.observer = new MutationObserver(() => {
            if (window.topicBlockUpdating) {
                return;
            }

            // Keep busy pages from postponing the scan forever. News portals
            // can mutate ads, scores, and lazy-loaded cards continuously, so a
            // traditional debounce may never get its quiet period.
            if (this.timer) {
                return;
            }

            this.timer = setTimeout(() => {
                this.timer = null;

                if (window.topicBlockUpdating) {
                    return;
                }

                this.callback();
            }, 300);
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        clearTimeout(this.timer);
        this.timer = null;
    }
}

// Expose the class to non-module content scripts.
window.Observer = Observer;