"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const Logger_1 = require("../services/Logger");
const logger = new Logger_1.Logger('ErrorMiddleware');
function errorMiddleware(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
    logger.error('Request error:', err);
    const status = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(status).json({
        error: {
            message: err.message,
            status,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
}
//# sourceMappingURL=error.middleware.js.map