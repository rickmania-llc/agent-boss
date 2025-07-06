"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workItems_routes_1 = __importDefault(require("./workItems.routes"));
const agents_routes_1 = __importDefault(require("./agents.routes"));
const config_routes_1 = __importDefault(require("./config.routes"));
const router = (0, express_1.Router)();
router.use('/work-items', workItems_routes_1.default);
router.use('/agents', agents_routes_1.default);
router.use('/config', config_routes_1.default);
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.default = router;
//# sourceMappingURL=index.js.map