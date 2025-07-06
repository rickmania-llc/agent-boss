"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
    database: {
        path: process.env.DATABASE_PATH || './data/agent-boss.db'
    },
    logging: {
        level: process.env.LOG_LEVEL || 'debug'
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
    }
};
//# sourceMappingURL=config.js.map