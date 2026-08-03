export class Logger {

    static enabled = true;

    static log(...args){

        if(this.enabled){

            console.log("[TopicBlock]", ...args);

        }

    }

    static warn(...args){

        if(this.enabled){

            console.warn("[TopicBlock]", ...args);

        }

    }

    static error(...args){

        console.error("[TopicBlock]", ...args);

    }

}