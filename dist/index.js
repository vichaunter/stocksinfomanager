"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const node_path_1 = __importDefault(require("node:path"));
const routes_1 = require("./routes");
const database_1 = __importDefault(require("./services/database"));
const updater_1 = __importDefault(require("./services/updater"));
dotenv_1.default.config({ path: node_path_1.default.join("..", ".env") });
database_1.default.init();
if (process.env.MODE === "services") {
    const services = async () => {
        await updater_1.default.loadStoredTickers();
        updater_1.default.tickerUpdaterService();
    };
    services();
}
else {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    (0, routes_1.mapRoutes)(app);
    const server = app.listen(4000, async () => {
        const { port } = server.address();
        console.log(`Server started on port: http://localhost:${port}`);
    });
}
