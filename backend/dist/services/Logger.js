"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = require("../config");
class Logger {
    logger;
    constructor(context) {
        this.logger = winston_1.default.createLogger({
            level: config_1.config.logging.level,
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
            defaultMeta: { context },
            transports: [
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
                })
            ]
        });
    }
    info(message, ...meta) {
        this.logger.info(message, ...meta);
    }
    error(message, ...meta) {
        this.logger.error(message, ...meta);
    }
    warn(message, ...meta) {
        this.logger.warn(message, ...meta);
    }
    debug(message, ...meta) {
        this.logger.debug(message, ...meta);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map