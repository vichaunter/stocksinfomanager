"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const node_path_1 = __importDefault(require("node:path"));
const database_1 = __importDefault(require("./services/database"));
const updater_1 = __importDefault(require("./services/updater"));
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
const api_1 = require("./api");
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
    async function api() {
        const server = new server_1.ApolloServer({
            typeDefs: api_1.typeDefs,
            resolvers: api_1.resolvers,
        });
        const { url } = await (0, standalone_1.startStandaloneServer)(server, {
            listen: { port: 4000 },
        });
        console.log(`server started at ${url}`);
    }
    api();
    // const app = express();
    // app.use(express.json());
    // mapRoutes(app);
    // const server = app.listen(4000, async () => {
    //   const { port } = server.address() as { port: number };
    //   console.log(`Server started on port: http://localhost:${port}`);
    // });
}
