// Statistics have their own storage key and a single writer (the service worker).
// The old settings.blockedTotal field is read only during migration.
export const STATISTICS_KEY = "topicblock_statistics";
export const SESSION_KEY = "blockedSession";
const SETTINGS_KEY = "topicblock_settings";

function count(value) {
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function createStatistics(storage) {
    let pending = Promise.resolve();

    function enqueue(operation) {
        const result = pending.then(operation);
        // A failed storage operation must not stop later requests.
        pending = result.catch(() => {});
        return result;
    }

    async function read() {
        const local = await storage.local.get([STATISTICS_KEY, SETTINGS_KEY]);
        const session = await storage.session.get(SESSION_KEY);
        const blockedSession = count(session[SESSION_KEY]);
        const saved = local[STATISTICS_KEY];
        const previousTotal = saved === undefined
            ? count(local[SETTINGS_KEY]?.blockedTotal)
            : count(saved.blockedTotal);
        // Recover at least the known session count if the old total was overwritten.
        const blockedTotal = Math.max(previousTotal, blockedSession);
        if (saved === undefined || saved.blockedTotal !== blockedTotal) {
            await storage.local.set({ [STATISTICS_KEY]: { blockedTotal } });
        }
        return { blockedTotal, blockedSession };
    }

    return {
        read: () => enqueue(read),
        increment(amount) {
            if (!Number.isSafeInteger(amount) || amount <= 0) {
                return Promise.reject(new TypeError("Invalid blocked count"));
            }
            return enqueue(async () => {
                const previous = await read();
                const blockedTotal = previous.blockedTotal + amount;
                const blockedSession = previous.blockedSession + amount;
                if (!Number.isSafeInteger(blockedTotal)) {
                    throw new RangeError("Blocked count exceeds safe integer range");
                }
                // Persist the historical total first; reads wait for both writes.
                await storage.local.set({ [STATISTICS_KEY]: { blockedTotal } });
                await storage.session.set({ [SESSION_KEY]: blockedSession });
                return { blockedTotal, blockedSession };
            });
        }
    };
}
