import axios from 'axios';
import { getDeviceFingerprint } from './fingerprint.js';
import { openIdentityModal } from './identity-modal.js';
export class Vouch {
    http;
    apiKey;
    verifyUrl;
    apiUrl;
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey;
        const baseURL = options.apiUrl || (typeof process !== 'undefined' && process.env?.VOUCH_API_URL) || 'https://vouchsdk.onrender.com';
        this.verifyUrl = options.verifyUrl || 'https://vouchsdk-modal.vercel.app';
        this.apiUrl = baseURL;
        this.http = axios.create({
            baseURL,
            headers: { 'x-api-key': apiKey },
        });
    }
    identity = {
        /**
         * Launch the Vouch Identity verification modal.
         * @param externalUserId The ID of the user in your system.
         * @returns A promise that resolves with the verification result when the user completes the flow.
         */
        verify: (externalUserId) => {
            return new Promise((resolve, reject) => {
                openIdentityModal({
                    verifyUrl: this.verifyUrl,
                    apiKey: this.apiKey,
                    externalUserId,
                    apiUrl: this.apiUrl,
                    onResult: resolve,
                    onError: reject,
                    onCancel: () => reject({ cancelled: true }),
                });
            });
        },
        /**
         * Submit verification data with multiple selfie frames
         */
        submitVerification: async (documentFile, selfieFrames, externalUserId) => {
            const deviceFingerprint = await getDeviceFingerprint();
            const formData = new FormData();
            formData.append('external_user_id', externalUserId);
            formData.append('device_fingerprint', deviceFingerprint);
            formData.append('document_image', documentFile, 'document.png');
            // Append all frames
            selfieFrames.forEach((file, index) => {
                formData.append('selfie_images', file, `selfie_frame_${index}.jpg`);
            });
            const res = await this.http.post('/identity/verify', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
    };
    fraud = {
        assess: async (params) => {
            const deviceFingerprint = await getDeviceFingerprint();
            const res = await this.http.post('/fraud/assess', {
                platformUserId: params.platformUserId,
                agreementId: params.agreementId,
                transactionAmount: params.transactionAmount,
                deviceFingerprint,
                simulateVpn: params.simulateVpn,
                simulateImpossibleTravel: params.simulateImpossibleTravel,
            });
            return res.data;
        },
    };
    escrow = {
        create: async (params) => {
            const res = await this.http.post('/escrow/agreements', params);
            const data = res.data;
            if (data && !data.id && data.agreementId) {
                data.id = data.agreementId;
            }
            return data;
        },
        assess: async (agreementId, params) => {
            const deviceFingerprint = await getDeviceFingerprint();
            const res = await this.http.post(`/escrow/agreements/${agreementId}/assess`, {
                external_user_id: params.externalUserId,
                transaction_amount: params.transactionAmount,
                device_fingerprint: deviceFingerprint,
                simulate_vpn: params.simulateVpn,
                simulate_impossible_travel: params.simulateImpossibleTravel,
            });
            return res.data;
        },
        confirm: async (agreementId, milestoneId, externalUserId) => {
            const res = await this.http.post(`/escrow/agreements/${agreementId}/milestones/${milestoneId}/confirm`, { external_user_id: externalUserId });
            return res.data;
        },
        status: async (agreementId) => {
            const res = await this.http.get(`/escrow/agreements/${agreementId}`);
            const data = res.data;
            if (data && !data.id && data.agreementId) {
                data.id = data.agreementId;
            }
            return data;
        },
    };
}
export default Vouch;
// Helper
async function fileToBase64(file) {
    if (typeof FileReader === 'undefined') {
        // Node.js environment
        const buffer = await file.arrayBuffer();
        return Buffer.from(buffer).toString('base64');
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            resolve(result.split(',')[1] || result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
