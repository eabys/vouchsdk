/**
 * Identity Modal UI Logic for Vouch SDK
 * Handles the creation and management of the verification iframe and overlay.
 */
export interface OpenModalParams {
    verifyUrl: string;
    apiKey: string;
    externalUserId: string;
    apiUrl?: string;
    onResult: (result: any) => void;
    onError: (err: Error) => void;
    onCancel: () => void;
}
export declare function openIdentityModal(params: OpenModalParams): void;
