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

            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
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