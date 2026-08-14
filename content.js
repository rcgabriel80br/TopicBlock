console.log("TopicBlock started");
// Wait for the filter to load its settings.
window.addEventListener(
    "topicblock-ready",
    () => {
        if (typeof window.scanPage === "function") {
            window.scanPage();
        } else {
            console.error(
                "[TopicBlock] scanPage() was not found."
            );
        }
    }
);
// Start the observer.
const observer = new window.Observer(async () => {
    observer.stop();
    try {
        if (typeof window.scanPage === "function") {
            window.scanPage();
        }
    } finally {
        observer.start();
    }
});
observer.start();
