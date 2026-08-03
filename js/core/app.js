export class App {
    static name = "TopicBlock";
    static version = chrome.runtime.getManifest().version;
    static initialized = false;
    static init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        console.log(`${this.name} ${this.version} iniciado.`);
    }
}