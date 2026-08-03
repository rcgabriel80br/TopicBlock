class Observer {
    constructor(callback) {
        this.callback = callback;
        this.observer = null;
    }
    start() {
        if (this.observer) {
            return;
        }
        let timer = null;
        this.observer = new MutationObserver((mutations) => {
            console.log(
                "[TopicBlock OBSERVER] Mutações detectadas:",
                mutations.length
            );
            mutations.forEach(mutation => {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            const text =
                                node.innerText || "";
                            if (
                                text.toLowerCase().includes("neymar")
                            ) {
                                console.log(
                                    "[TopicBlock] DOM recriado com NEYMAR:",
                                    node
                                );
                            }
                        }
                    });
                }
            });
            if (window.topicBlockUpdating) {
                console.log(
                    "[TopicBlock] Ignorando mutação própria"
                );
                return;
            }
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (window.topicBlockUpdating) {
                    console.log(
                        "[TopicBlock] Callback cancelado - atualização própria"
                    );
                    return;
                }
                console.log(
                    "[TopicBlock OBSERVER] Executando callback"
                );
                console.log(
                    "[TopicBlock OBSERVER] Chamaria scanPage agora"
                );
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
    }
}
// disponibiliza a classe globalmente
window.Observer = Observer;