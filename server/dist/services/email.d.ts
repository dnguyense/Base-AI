export declare const sendVerificationEmail: (email: string, token: string) => Promise<void>;
export declare const sendPasswordResetEmail: (email: string, token: string) => Promise<void>;
export declare const sendWelcomeEmail: (email: string, firstName?: string) => Promise<void>;
export declare const testEmailConnection: () => Promise<boolean>;
export declare const sendSubscriptionEmail: (email: string, plan: string, amount: number, firstName?: string) => Promise<void>;
export declare const sendDownloadReadyEmail: (email: string, downloadData: {
    fileName: string;
    originalSize: string;
    compressedSize: string;
    compressionRate: string;
    downloadLink: string;
    firstName?: string;
}) => Promise<void>;
export declare const sendPaymentReceiptEmail: (email: string, receiptData: {
    firstName?: string;
    invoiceId: string;
    planName: string;
    interval: string;
    amount: number;
    currency: string;
    last4: string;
    paymentDate: string;
    nextBilling: string;
}) => Promise<void>;
export declare const sendSubscriptionExpiryEmail: (email: string, expiryData: {
    firstName?: string;
    planName: string;
    expiryDate: string;
    daysRemaining: number;
}) => Promise<void>;
declare const _default: {
    sendVerificationEmail: (email: string, token: string) => Promise<void>;
    sendPasswordResetEmail: (email: string, token: string) => Promise<void>;
    sendWelcomeEmail: (email: string, firstName?: string) => Promise<void>;
    sendSubscriptionEmail: (email: string, plan: string, amount: number, firstName?: string) => Promise<void>;
    sendDownloadReadyEmail: (email: string, downloadData: {
        fileName: string;
        originalSize: string;
        compressedSize: string;
        compressionRate: string;
        downloadLink: string;
        firstName?: string;
    }) => Promise<void>;
    sendPaymentReceiptEmail: (email: string, receiptData: {
        firstName?: string;
        invoiceId: string;
        planName: string;
        interval: string;
        amount: number;
        currency: string;
        last4: string;
        paymentDate: string;
        nextBilling: string;
    }) => Promise<void>;
    sendSubscriptionExpiryEmail: (email: string, expiryData: {
        firstName?: string;
        planName: string;
        expiryDate: string;
        daysRemaining: number;
    }) => Promise<void>;
    testEmailConnection: () => Promise<boolean>;
};
export default _default;
//# sourceMappingURL=email.d.ts.map