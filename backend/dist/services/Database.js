"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const knex_1 = __importDefault(require("knex"));
const config_1 = require("../config");
const Logger_1 = require("./Logger");
class Database {
    db;
    logger;
    constructor() {
        this.logger = new Logger_1.Logger('Database');
        this.db = (0, knex_1.default)({
            client: 'sqlite3',
            connection: {
                filename: config_1.config.database.path
            },
            useNullAsDefault: true
        });
    }
    async initialize() {
        try {
            await this.createTables();
            this.logger.info('Database initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize database:', error);
            throw error;
        }
    }
    async createTables() {
        // Work Items table
        await this.db.schema.createTableIfNotExists('work_items', (table) => {
            table.increments('id').primary();
            table.string('title').notNullable();
            table.text('description');
            table.string('status').notNullable().defaultTo('pending');
            table.string('priority').notNullable().defaultTo('medium');
            table.timestamps(true, true);
        });
        // Agents table
        await this.db.schema.createTableIfNotExists('agents', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('status').notNullable().defaultTo('idle');
            table.integer('work_item_id').references('id').inTable('work_items');
            table.integer('pid');
            table.timestamps(true, true);
        });
        // Phases table
        await this.db.schema.createTableIfNotExists('phases', (table) => {
            table.increments('id').primary();
            table.integer('work_item_id').references('id').inTable('work_items').notNullable();
            table.string('name').notNullable();
            table.text('description');
            table.string('status').notNullable().defaultTo('pending');
            table.integer('order_index').notNullable();
            table.timestamps(true, true);
        });
        // Revisions table
        await this.db.schema.createTableIfNotExists('revisions', (table) => {
            table.increments('id').primary();
            table.integer('work_item_id').references('id').inTable('work_items').notNullable();
            table.integer('phase_id').references('id').inTable('phases');
            table.text('content').notNullable();
            table.string('type').notNullable();
            table.timestamps(true, true);
        });
    }
    getConnection() {
        return this.db;
    }
    async close() {
        await this.db.destroy();
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map