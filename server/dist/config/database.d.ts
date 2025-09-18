import { Sequelize } from 'sequelize';
declare let sequelize: Sequelize;
export default sequelize;
export declare const connectDatabase: () => Promise<void>;
export declare const syncDatabase: (force?: boolean) => Promise<void>;
//# sourceMappingURL=database.d.ts.map