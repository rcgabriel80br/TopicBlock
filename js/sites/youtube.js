export class YouTubeSite {

    static isCurrentSite() {

        return location.hostname.includes("youtube.com");

    }

}