"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingMiddleware = loggingMiddleware;
const Logger_1 = require("../services/Logger");
const logger = new Logger_1.Logger('HTTP');
function loggingMiddleware(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
    next();
}
//# sourceMappingURL=logging.middleware.js.map