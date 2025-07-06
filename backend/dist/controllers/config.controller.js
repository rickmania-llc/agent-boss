"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
const config_1 = require("../config");
async function getConfig(req, res, next) {
    try {
        res.json({
            environment: config_1.config.nodeEnv,
            port: config_1.config.port,
            version: '1.0.0'
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=config.controller.js.map