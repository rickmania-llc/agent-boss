"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const Database_1 = require("./services/Database");
const AgentManager_1 = require("./services/AgentManager");
const WorkItemService_1 = require("./services/WorkItemService");
const Logger_1 = require("./services/Logger");
const error_middleware_1 = require("./middleware/error.middleware");
const logging_middleware_1 = require("./middleware/logging.middleware");
const routes_1 = __importDefault(require("./routes"));
async function createApp() {
    const app = (0, express_1.default)();
    const server = new http_1.Server(app);
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true
        }
    });
    const logger = new Logger_1.Logger('App');
    // Initialize services
    const database = new Database_1.Database();
    await database.initialize();
    const agentManager = new AgentManager_1.AgentManager(io);
    const workItemService = new WorkItemService_1.WorkItemService(database, agentManager);
    // Middleware
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true
    }));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(logging_middleware_1.loggingMiddleware);
    // Attach services to request
    app.locals.services = {
        database,
        agentManager,
        workItemService,
        logger
    };
    // Routes
    app.use('/api', routes_1.default);
    // Socket.io connection handling
    io.on('connection', (socket) => {
        logger.info('Client connected:', socket.id);
        socket.on('disconnect', () => {
            logger.info('Client disconnected:', socket.id);
        });
    });
    // Error handling middleware (must be last)
    app.use(error_middleware_1.errorMiddleware);
    return { app, server };
}
//# sourceMappingURL=app.js.map