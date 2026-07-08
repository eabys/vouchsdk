import FingerprintJS from '@fingerprintjs/fingerprintjs';
let cachedFingerprint = null;
export async function getDeviceFingerprint() {
    // Support mock fingerprint for local testing
    if (typeof globalThis !== 'undefined' && globalThis.MOCK_FINGERPRINT) {
        return globalThis.MOCK_FINGERPRINT;
    }
    // Cache it so FingerprintJS doesn't re-run on every call
    if (cachedFingerprint)
        return cachedFingerprint;
    if (typeof window === 'undefined') {
        return 'node-server-fingerprint';
    }
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    cachedFingerprint = result.visitorId;
    return cachedFingerprint;
}
