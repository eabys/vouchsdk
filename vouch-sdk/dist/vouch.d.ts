export interface IdentityVerifyResult {
    status: string;
    message: string;
    data: {
        id: string;
        externalUserId: string;
        identityVerified: boolean;
        identityMatchScore?: number | null;
        livenessPassed: boolean;
        documentType?: string | null;
    };
}
export interface FraudAssessParams {
    platformUserId: string;
    agreementId?: string;
    transactionAmount: number;
    simulateVpn?: boolean;
    simulateImpossibleTravel?: boolean;
}
export interface FraudAssessResult {
    score: number;
    flag: 'GREEN' | 'AMBER' | 'RED';
    category: string;
    triggeredSignals: string[];
    recommendation: string;
}
export interface MilestoneInput {
    title: string;
    amount: number;
}
export interface CreateAgreementParams {
    buyerExternalId: string;
    sellerExternalId: string;
    totalAmount: number;
    currency?: string;
    milestones: MilestoneInput[];
    buyerEmail?: string;
    buyerName?: string;
}
export interface AgreementResponse {
    id: string;
    agreementId?: string;
    developerId: string;
    buyerExternalId: string;
    sellerExternalId: string;
    status: string;
    nombaVirtualAccountId?: string | null;
    nombaVirtualAccountNo?: string | null;
    nombaVirtualAccountRef?: string | null;
    nombaBank?: string | null;
    totalAmount: number;
    amountReceived?: number;
    currency: string;
    createdAt: string;
    milestones: {
        id: string;
        title: string;
        amount: number;
        buyerConfirmed: boolean;
        sellerConfirmed: boolean;
        status: string;
        disbursedAt?: string | null;
    }[];
}
export interface AssessPaymentParams {
    externalUserId: string;
    transactionAmount: number;
    simulateVpn?: boolean;
    simulateImpossibleTravel?: boolean;
}
export interface AssessPaymentResponse {
    status: string;
    score: number;
    flag: 'GREEN' | 'AMBER' | 'RED';
    triggeredSignals?: string[];
    nombaVirtualAccountId?: string | null;
    nombaVirtualAccountNo?: string | null;
    nombaBank?: string | null;
    amount?: number;
    message?: string;
}
export interface VouchOptions {
    apiUrl?: string;
    verifyUrl?: string;
}
export declare class Vouch {
    private readonly http;
    private readonly apiKey;
    private readonly verifyUrl;
    private readonly apiUrl;
    constructor(apiKey: string, options?: VouchOptions);
    identity: {
        /**
         * Launch the Vouch Identity verification modal.
         * @param externalUserId The ID of the user in your system.
         * @returns A promise that resolves with the verification result when the user completes the flow.
         */
        verify: (externalUserId: string) => Promise<IdentityVerifyResult>;
        /**
         * Submit verification data with multiple selfie frames
         */
        submitVerification: (documentFile: File | Blob, selfieFrames: (File | Blob)[], externalUserId: string) => Promise<IdentityVerifyResult>;
    };
    fraud: {
        assess: (params: FraudAssessParams) => Promise<FraudAssessResult>;
    };
    escrow: {
        create: (params: CreateAgreementParams) => Promise<AgreementResponse>;
        assess: (agreementId: string, params: AssessPaymentParams) => Promise<AssessPaymentResponse>;
        confirm: (agreementId: string, milestoneId: string, externalUserId: string) => Promise<any>;
        status: (agreementId: string) => Promise<AgreementResponse>;
    };
}
export default Vouch;
