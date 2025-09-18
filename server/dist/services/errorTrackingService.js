"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorTrackingService = exports.ErrorTrackingService = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const events_1 = require("events");
class ErrorTrackingService extends events_1.EventEmitter {
    constructor() {
        super();
        this.errorLogs = [];
        this.feedbackEntries = [];
        this.maxLogEntries = 1000;
        this.maxFeedbackEntries = 500;
        this.logFilePath = path_1.default.join(__dirname, '../../logs/error-log.json');
        this.feedbackFilePath = path_1.default.join(__dirname, '../../logs/feedback-log.json');
        this.initializeStorage();
        this.loadExistingData();
    }
    async initializeStorage() {
        const logsDir = path_1.default.join(__dirname, '../../logs');
        await fs_extra_1.default.ensureDir(logsDir);
        if (!(await fs_extra_1.default.pathExists(this.logFilePath))) {
            await fs_extra_1.default.writeJson(this.logFilePath, []);
        }
        if (!(await fs_extra_1.default.pathExists(this.feedbackFilePath))) {
            await fs_extra_1.default.writeJson(this.feedbackFilePath, []);
        }
    }
    async loadExistingData() {
        try {
            this.errorLogs = await fs_extra_1.default.readJson(this.logFilePath);
            this.feedbackEntries = await fs_extra_1.default.readJson(this.feedbackFilePath);
            this.errorLogs = this.errorLogs.map(log => ({
                ...log,
                timestamp: new Date(log.timestamp)
            }));
            this.feedbackEntries = this.feedbackEntries.map(feedback => ({
                ...feedback,
                timestamp: new Date(feedback.timestamp)
            }));
        }
        catch (error) {
            console.warn('Failed to load existing error tracking data:', error);
            this.errorLogs = [];
            this.feedbackEntries = [];
        }
    }
    async logError(errorData) {
        const errorLog = {
            id: this.generateId(),
            timestamp: new Date(),
            ...errorData
        };
        this.errorLogs.unshift(errorLog);
        if (this.errorLogs.length > this.maxLogEntries) {
            this.errorLogs = this.errorLogs.slice(0, this.maxLogEntries);
        }
        await this.persistErrorLogs();
        this.emit('errorLogged', errorLog);
        if (errorLog.level === 'error' && errorLog.statusCode && errorLog.statusCode >= 500) {
            this.emit('criticalError', errorLog);
        }
        return errorLog.id;
    }
    async submitFeedback(feedbackData) {
        const feedback = {
            id: this.generateId(),
            timestamp: new Date(),
            status: 'open',
            ...feedbackData
        };
        this.feedbackEntries.unshift(feedback);
        if (this.feedbackEntries.length > this.maxFeedbackEntries) {
            this.feedbackEntries = this.feedbackEntries.slice(0, this.maxFeedbackEntries);
        }
        await this.persistFeedback();
        this.emit('feedbackSubmitted', feedback);
        if (feedback.severity === 'critical') {
            this.emit('criticalFeedback', feedback);
        }
        return feedback.id;
    }
    getErrorLogs(options = {}) {
        let logs = [...this.errorLogs];
        if (options.level) {
            logs = logs.filter(log => log.level === options.level);
        }
        if (options.since) {
            logs = logs.filter(log => log.timestamp >= options.since);
        }
        if (options.userId) {
            logs = logs.filter(log => log.userId === options.userId);
        }
        if (options.limit) {
            logs = logs.slice(0, options.limit);
        }
        return logs;
    }
    getFeedback(options = {}) {
        let feedback = [...this.feedbackEntries];
        if (options.type) {
            feedback = feedback.filter(entry => entry.type === options.type);
        }
        if (options.status) {
            feedback = feedback.filter(entry => entry.status === options.status);
        }
        if (options.severity) {
            feedback = feedback.filter(entry => entry.severity === options.severity);
        }
        if (options.since) {
            feedback = feedback.filter(entry => entry.timestamp >= options.since);
        }
        if (options.limit) {
            feedback = feedback.slice(0, options.limit);
        }
        return feedback;
    }
    getErrorStats(days = 7) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const recentErrors = this.getErrorLogs({ since });
        const errorsByLevel = {};
        recentErrors.forEach(error => {
            errorsByLevel[error.level] = (errorsByLevel[error.level] || 0) + 1;
        });
        const errorsByType = {};
        recentErrors.forEach(error => {
            if (error.statusCode) {
                const type = this.categorizeError(error.statusCode);
                errorsByType[type] = (errorsByType[type] || 0) + 1;
            }
        });
        const errorCounts = {};
        recentErrors.forEach(error => {
            const key = error.message.substring(0, 100);
            errorCounts[key] = (errorCounts[key] || 0) + 1;
        });
        const topErrors = Object.entries(errorCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([message, count]) => ({ message, count }));
        const errorTrend = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayErrors = recentErrors.filter(error => error.timestamp.toISOString().startsWith(dateStr)).length;
            errorTrend.push({ date: dateStr, count: dayErrors });
        }
        return {
            totalErrors: recentErrors.length,
            errorsByLevel,
            errorsByType,
            topErrors,
            errorTrend
        };
    }
    async updateFeedbackStatus(id, status) {
        const feedback = this.feedbackEntries.find(entry => entry.id === id);
        if (!feedback) {
            return false;
        }
        feedback.status = status;
        await this.persistFeedback();
        this.emit('feedbackUpdated', feedback);
        return true;
    }
    getUserFriendlyMessage(error, context) {
        const message = error.message.toLowerCase();
        if (message.includes('file too large')) {
            return 'The file you uploaded is too large. Please choose a file smaller than 10MB.';
        }
        if (message.includes('invalid file type') || message.includes('not a pdf')) {
            return 'Please upload a valid PDF file. Other file types are not supported.';
        }
        if (message.includes('network') || message.includes('connection')) {
            return 'Connection error. Please check your internet connection and try again.';
        }
        if (message.includes('timeout')) {
            return 'The operation took too long to complete. Please try again with a smaller file.';
        }
        if (message.includes('unauthorized') || message.includes('authentication')) {
            return 'Please log in to access this feature.';
        }
        if (message.includes('payment') || message.includes('subscription')) {
            return 'There was an issue with your subscription. Please check your account or contact support.';
        }
        if (message.includes('server error') || message.includes('internal error')) {
            return 'We\'re experiencing technical difficulties. Please try again in a few minutes.';
        }
        return 'Something went wrong. Please try again or contact support if the problem persists.';
    }
    getRecoverySuggestions(error, context) {
        const message = error.message.toLowerCase();
        const suggestions = [];
        if (message.includes('file too large')) {
            suggestions.push('Try compressing your PDF before uploading');
            suggestions.push('Split large PDFs into smaller files');
            suggestions.push('Use our premium plan for larger file limits');
        }
        if (message.includes('invalid file type')) {
            suggestions.push('Make sure your file has a .pdf extension');
            suggestions.push('Try opening the file in a PDF viewer to verify it\'s valid');
            suggestions.push('Convert other formats to PDF first');
        }
        if (message.includes('network')) {
            suggestions.push('Check your internet connection');
            suggestions.push('Try refreshing the page');
            suggestions.push('Disable any ad blockers or firewall software');
        }
        if (message.includes('timeout')) {
            suggestions.push('Try uploading a smaller file');
            suggestions.push('Check your internet connection speed');
            suggestions.push('Try again during off-peak hours');
        }
        if (suggestions.length === 0) {
            suggestions.push('Refresh the page and try again');
            suggestions.push('Clear your browser cache');
            suggestions.push('Try using a different browser');
            suggestions.push('Contact our support team for assistance');
        }
        return suggestions;
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    categorizeError(statusCode) {
        if (statusCode >= 400 && statusCode < 500) {
            return 'Client Error';
        }
        else if (statusCode >= 500) {
            return 'Server Error';
        }
        else {
            return 'Unknown Error';
        }
    }
    async persistErrorLogs() {
        try {
            await fs_extra_1.default.writeJson(this.logFilePath, this.errorLogs, { spaces: 2 });
        }
        catch (error) {
            console.error('Failed to persist error logs:', error);
        }
    }
    async persistFeedback() {
        try {
            await fs_extra_1.default.writeJson(this.feedbackFilePath, this.feedbackEntries, { spaces: 2 });
        }
        catch (error) {
            console.error('Failed to persist feedback:', error);
        }
    }
}
exports.ErrorTrackingService = ErrorTrackingService;
exports.errorTrackingService = new ErrorTrackingService();
//# sourceMappingURL=errorTrackingService.js.map