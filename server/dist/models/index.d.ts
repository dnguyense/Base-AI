import sequelize from '../config/database';
import User from './User';
import Subscription from './Subscription';
import ProcessedFiles from './ProcessedFiles';
export { sequelize, User, Subscription, ProcessedFiles, };
export type { UserAttributes } from './User';
export type { SubscriptionAttributes } from './Subscription';
export type { ProcessedFilesAttributes } from './ProcessedFiles';
export declare const initializeDatabase: () => Promise<void>;
declare const _default: {
    sequelize: import("sequelize").Sequelize;
    User: typeof User;
    Subscription: typeof Subscription;
    ProcessedFiles: typeof ProcessedFiles;
    initializeDatabase: () => Promise<void>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map