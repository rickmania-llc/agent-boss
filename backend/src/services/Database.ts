import knex, { Knex } from 'knex';
import { config } from '../config';
import { Logger } from './Logger';

export class Database {
  private db: Knex;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('Database');
    this.db = knex({
      client: 'sqlite3',
      connection: {
        filename: config.database.path,
      },
      useNullAsDefault: true,
    });
  }

  async initialize() {
    try {
      await this.createTables();
      this.logger.info('Database initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables() {
    // Work Items table
    await this.db.schema.createTableIfNotExists('work_items', table => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('description');
      table.string('status').notNullable().defaultTo('pending');
      table.string('priority').notNullable().defaultTo('medium');
      table.timestamps(true, true);
    });

    // Agents table
    await this.db.schema.createTableIfNotExists('agents', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('status').notNullable().defaultTo('idle');
      table.integer('work_item_id').references('id').inTable('work_items');
      table.integer('pid');
      table.timestamps(true, true);
    });

    // Phases table
    await this.db.schema.createTableIfNotExists('phases', table => {
      table.increments('id').primary();
      table.integer('work_item_id').references('id').inTable('work_items').notNullable();
      table.string('name').notNullable();
      table.text('description');
      table.string('status').notNullable().defaultTo('pending');
      table.integer('order_index').notNullable();
      table.timestamps(true, true);
    });

    // Revisions table
    await this.db.schema.createTableIfNotExists('revisions', table => {
      table.increments('id').primary();
      table.integer('work_item_id').references('id').inTable('work_items').notNullable();
      table.integer('phase_id').references('id').inTable('phases');
      table.text('content').notNullable();
      table.string('type').notNullable();
      table.timestamps(true, true);
    });
  }

  getConnection(): Knex {
    return this.db;
  }

  async close() {
    await this.db.destroy();
  }
}
