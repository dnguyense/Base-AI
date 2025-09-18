import { EventEmitter } from 'events';
export interface CleanupConfig {
    maxAgeHours: number;
    maxStorageMB: number;
    cleanupIntervalHours: number;
    retentionPolicies: {
        temporary: number;
        processed: number;
        batch: number;
        user: number;
    };
}
export interface CleanupStats {
    filesDeleted: number;
    spaceFreeKB: number;
    errors: number;
    duration: number;
    timestamp: Date;
}
export interface FileInfo {
    path: string;
    size: number;
    created: Date;
    lastAccessed: Date;
    type: 'temporary' | 'processed' | 'batch' | 'user';
}
export declare class FileCleanupService extends EventEmitter {
    private config;
    private isRunning;
    private cleanupTask;
    private baseDirectories;
    private cleanupHistory;
    private maxHistoryEntries;
    constructor(config?: Partial<CleanupConfig>);
    private ensureDirectories;
    startScheduler(): void;
    stopScheduler(): void;
    runCleanup(force?: boolean): Promise<CleanupStats>;
    private scanFiles;
    private scanDirectory;
    private categorizeFile;
    private shouldDeleteFile;
    private deleteFile;
    private cleanupEmptyDirectories;
    private removeEmptyDirs;
    getStorageInfo(): Promise<{
        totalMB: number;
        fileCount: number;
        directories: {
            [key: string]: {
                sizeMB: number;
                fileCount: number;
            };
        };
    }>;
    private hasExpiredFiles;
    private addToHistory;
    getCleanupHistory(limit?: number): CleanupStats[];
    emergencyCleanup(maxAgeHours?: number): Promise<CleanupStats>;
    getStatus(): {
        isRunning: boolean;
        schedulerActive: boolean;
        config: CleanupConfig;
        lastCleanup?: CleanupStats;
    };
    updateConfig(newConfig: Partial<CleanupConfig>): void;
}
export declare const fileCleanupService: FileCleanupService;
//# sourceMappingURL=fileCleanupService.d.ts.map