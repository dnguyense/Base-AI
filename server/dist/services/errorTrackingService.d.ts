import { EventEmitter } from 'events';
export interface ErrorLog {
    id: string;
    timestamp: Date;
    level: 'error' | 'warning' | 'info';
    message: string;
    stack?: string;
    userId?: string;
    userAgent?: string;
    url?: string;
    method?: string;
    statusCode?: number;
    metadata?: Record<string, any>;
}
export interface FeedbackEntry {
    id: string;
    timestamp: Date;
    userId?: string;
    email?: string;
    type: 'bug_report' | 'feature_request' | 'general_feedback' | 'error_report';
    subject: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    metadata?: Record<string, any>;
}
export interface ErrorStats {
    totalErrors: number;
    errorsByLevel: Record<string, number>;
    errorsByType: Record<string, number>;
    topErrors: Array<{
        message: string;
        count: number;
    }>;
    errorTrend: Array<{
        date: string;
        count: number;
    }>;
}
export declare class ErrorTrackingService extends EventEmitter {
    private errorLogs;
    private feedbackEntries;
    private maxLogEntries;
    private maxFeedbackEntries;
    private logFilePath;
    private feedbackFilePath;
    constructor();
    private initializeStorage;
    private loadExistingData;
    logError(errorData: Omit<ErrorLog, 'id' | 'timestamp'>): Promise<string>;
    submitFeedback(feedbackData: Omit<FeedbackEntry, 'id' | 'timestamp' | 'status'>): Promise<string>;
    getErrorLogs(options?: {
        level?: string;
        limit?: number;
        since?: Date;
        userId?: string;
    }): ErrorLog[];
    getFeedback(options?: {
        type?: string;
        status?: string;
        severity?: string;
        limit?: number;
        since?: Date;
    }): FeedbackEntry[];
    getErrorStats(days?: number): ErrorStats;
    updateFeedbackStatus(id: string, status: FeedbackEntry['status']): Promise<boolean>;
    getUserFriendlyMessage(error: Error, context?: any): string;
    getRecoverySuggestions(error: Error, context?: any): string[];
    private generateId;
    private categorizeError;
    private persistErrorLogs;
    private persistFeedback;
}
export declare const errorTrackingService: ErrorTrackingService;
//# sourceMappingURL=errorTrackingService.d.ts.map