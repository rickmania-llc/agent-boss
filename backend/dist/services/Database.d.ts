import { Knex } from 'knex';
export declare class Database {
    private db;
    private logger;
    constructor();
    initialize(): Promise<void>;
    private createTables;
    getConnection(): Knex;
    close(): Promise<void>;
}
//# sourceMappingURL=Database.d.ts.map