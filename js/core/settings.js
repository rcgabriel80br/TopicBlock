import { DEFAULT_GROUPS } from "./constants.js";
export const DEFAULT_SETTINGS = {
    enabled: true,
    debug: true,
    blockedTotal: 0,
    ignoredSites: [
        "google.com",
        "chatgpt.com",
        "wikipedia.org",
        "outlook.live.com",
        "web.whatsapp.com",
        "claude.ai"
    ],
    groups: DEFAULT_GROUPS
};