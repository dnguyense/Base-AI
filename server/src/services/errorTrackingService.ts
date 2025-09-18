import fs from 'fs-extra';
import path from 'path';
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
  topErrors: Array<{ message: string; count: number }>;
  errorTrend: Array<{ date: string; count: number }>;
}

export class ErrorTrackingService extends EventEmitter {
  private errorLogs: ErrorLog[] = [];
  private feedbackEntries: FeedbackEntry[] = [];
  private maxLogEntries: number = 1000;
  private maxFeedbackEntries: number = 500;
  private logFilePath: string;
  private feedbackFilePath: string;

  constructor() {
    super();
    
    this.logFilePath = path.join(__dirname, '../../logs/error-log.json');
    this.feedbackFilePath = path.join(__dirname, '../../logs/feedback-log.json');
    
    this.initializeStorage();
    this.loadExistingData();
  }

  /**
   * Initialize storage directories and files
   */
  private async initializeStorage(): Promise<void> {
    const logsDir = path.join(__dirname, '../../logs');
    await fs.ensureDir(logsDir);
    
    if (!(await fs.pathExists(this.logFilePath))) {
      await fs.writeJson(this.logFilePath, []);
    }
    
    if (!(await fs.pathExists(this.feedbackFilePath))) {
      await fs.writeJson(this.feedbackFilePath, []);
    }
  }

  /**
   * Load existing data from storage
   */
  private async loadExistingData(): Promise<void> {
    try {
      this.errorLogs = await fs.readJson(this.logFilePath);
      this.feedbackEntries = await fs.readJson(this.feedbackFilePath);
      
      // Convert string dates back to Date objects
      this.errorLogs = this.errorLogs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
      
      this.feedbackEntries = this.feedbackEntries.map(feedback => ({
        ...feedback,
        timestamp: new Date(feedback.timestamp)
      }));
      
    } catch (error) {
      console.warn('Failed to load existing error tracking data:', error);
      this.errorLogs = [];
      this.feedbackEntries = [];
    }
  }

  /**
   * Log an error
   */
  public async logError(errorData: Omit<ErrorLog, 'id' | 'timestamp'>): Promise<string> {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      ...errorData
    };

    this.errorLogs.unshift(errorLog);
    
    // Maintain max entries limit
    if (this.errorLogs.length > this.maxLogEntries) {
      this.errorLogs = this.errorLogs.slice(0, this.maxLogEntries);
    }

    await this.persistErrorLogs();
    
    this.emit('errorLogged', errorLog);
    
    // Auto-create support ticket for critical errors
    if (errorLog.level === 'error' && errorLog.statusCode && errorLog.statusCode >= 500) {
      this.emit('criticalError', errorLog);
    }
    
    return errorLog.id;
  }

  /**
   * Submit user feedback
   */
  public async submitFeedback(feedbackData: Omit<FeedbackEntry, 'id' | 'timestamp' | 'status'>): Promise<string> {
    const feedback: FeedbackEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      status: 'open',
      ...feedbackData
    };

    this.feedbackEntries.unshift(feedback);
    
    // Maintain max entries limit
    if (this.feedbackEntries.length > this.maxFeedbackEntries) {
      this.feedbackEntries = this.feedbackEntries.slice(0, this.maxFeedbackEntries);
    }

    await this.persistFeedback();
    
    this.emit('feedbackSubmitted', feedback);
    
    // Auto-escalate high severity feedback
    if (feedback.severity === 'critical') {
      this.emit('criticalFeedback', feedback);
    }
    
    return feedback.id;
  }

  /**
   * Get error logs with filtering options
   */
  public getErrorLogs(options: {
    level?: string;
    limit?: number;
    since?: Date;
    userId?: string;
  } = {}): ErrorLog[] {
    let logs = [...this.errorLogs];

    // Filter by level
    if (options.level) {
      logs = logs.filter(log => log.level === options.level);
    }

    // Filter by date
    if (options.since) {
      logs = logs.filter(log => log.timestamp >= options.since!);
    }

    // Filter by user
    if (options.userId) {
      logs = logs.filter(log => log.userId === options.userId);
    }

    // Limit results
    if (options.limit) {
      logs = logs.slice(0, options.limit);
    }

    return logs;
  }

  /**
   * Get feedback entries with filtering options
   */
  public getFeedback(options: {
    type?: string;
    status?: string;
    severity?: string;
    limit?: number;
    since?: Date;
  } = {}): FeedbackEntry[] {
    let feedback = [...this.feedbackEntries];

    // Filter by type
    if (options.type) {
      feedback = feedback.filter(entry => entry.type === options.type);
    }

    // Filter by status
    if (options.status) {
      feedback = feedback.filter(entry => entry.status === options.status);
    }

    // Filter by severity
    if (options.severity) {
      feedback = feedback.filter(entry => entry.severity === options.severity);
    }

    // Filter by date
    if (options.since) {
      feedback = feedback.filter(entry => entry.timestamp >= options.since!);
    }

    // Limit results
    if (options.limit) {
      feedback = feedback.slice(0, options.limit);
    }

    return feedback;
  }

  /**
   * Get error statistics
   */
  public getErrorStats(days: number = 7): ErrorStats {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const recentErrors = this.getErrorLogs({ since });
    
    // Count errors by level
    const errorsByLevel: Record<string, number> = {};
    recentErrors.forEach(error => {
      errorsByLevel[error.level] = (errorsByLevel[error.level] || 0) + 1;
    });

    // Count errors by type (based on status code)
    const errorsByType: Record<string, number> = {};
    recentErrors.forEach(error => {
      if (error.statusCode) {
        const type = this.categorizeError(error.statusCode);
        errorsByType[type] = (errorsByType[type] || 0) + 1;
      }
    });

    // Top errors by message
    const errorCounts: Record<string, number> = {};
    recentErrors.forEach(error => {
      const key = error.message.substring(0, 100); // Truncate for grouping
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    const topErrors = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    // Error trend by day
    const errorTrend: Array<{ date: string; count: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayErrors = recentErrors.filter(error => 
        error.timestamp.toISOString().startsWith(dateStr)
      ).length;
      
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

  /**
   * Update feedback status
   */
  public async updateFeedbackStatus(id: string, status: FeedbackEntry['status']): Promise<boolean> {
    const feedback = this.feedbackEntries.find(entry => entry.id === id);
    if (!feedback) {
      return false;
    }

    feedback.status = status;
    await this.persistFeedback();
    
    this.emit('feedbackUpdated', feedback);
    return true;
  }

  /**
   * Get user-friendly error message
   */
  public getUserFriendlyMessage(error: Error, context?: any): string {
    const message = error.message.toLowerCase();
    
    // Common error patterns and user-friendly messages
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

    // Default message
    return 'Something went wrong. Please try again or contact support if the problem persists.';
  }

  /**
   * Get error recovery suggestions
   */
  public getRecoverySuggestions(error: Error, context?: any): string[] {
    const message = error.message.toLowerCase();
    const suggestions: string[] = [];

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

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Categorize error by status code
   */
  private categorizeError(statusCode: number): string {
    if (statusCode >= 400 && statusCode < 500) {
      return 'Client Error';
    } else if (statusCode >= 500) {
      return 'Server Error';
    } else {
      return 'Unknown Error';
    }
  }

  /**
   * Persist error logs to file
   */
  private async persistErrorLogs(): Promise<void> {
    try {
      await fs.writeJson(this.logFilePath, this.errorLogs, { spaces: 2 });
    } catch (error) {
      console.error('Failed to persist error logs:', error);
    }
  }

  /**
   * Persist feedback to file
   */
  private async persistFeedback(): Promise<void> {
    try {
      await fs.writeJson(this.feedbackFilePath, this.feedbackEntries, { spaces: 2 });
    } catch (error) {
      console.error('Failed to persist feedback:', error);
    }
  }
}

// Create singleton instance
export const errorTrackingService = new ErrorTrackingService();