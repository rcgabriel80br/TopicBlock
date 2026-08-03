import { DEFAULT_GROUPS } from "./constants.js";

export const DEFAULT_SETTINGS = {

    enabled: true,

    debug: true,

    showUnfilteredPage: false,
	
	blockedTotal: 0,

    blockedToday: 0,

    installedVersion: null,

    ignoredSites: [
        "google.com",
        "chatgpt.com",
        "wikipedia.com",
        "outlook.live.com",
        "web.whatsapp.com"
    ],

    groups: DEFAULT_GROUPS

};