"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fflate_1 = require("fflate");
const picocolors_1 = __importDefault(require("picocolors"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const constants_1 = require("../../constants");
const tickerModel_1 = __importDefault(require("../../models/tickerModel"));
const DatabaseHandler_1 = __importDefault(require("./DatabaseHandler"));
const dayjs_1 = __importDefault(require("dayjs"));
const utils_1 = require("../../utils");
function compressAndWriteFile(filePath, data) {
    const jsonData = JSON.stringify(data, null, 2);
    const compressedData = (0, fflate_1.zlibSync)((0, fflate_1.strToU8)(jsonData), { level: 9 });
    node_fs_1.default.writeFileSync(filePath, compressedData);
    console.log("File compressed and written successfully.");
    return true;
}
// Function to read a compressed file and decompress data
function readAndDecompressFile(filePath) {
    const compressedData = node_fs_1.default.readFileSync(filePath);
    const decompressedData = (0, fflate_1.decompressSync)(compressedData);
    const decoded = new TextDecoder().decode(decompressedData);
    const jsonData = JSON.parse(decoded);
    console.log("File read and decompressed successfully.");
    return jsonData;
}
const updateOrCreate = async (path, data) => {
    let current = {};
    try {
        const currentRaw = node_fs_1.default.readFileSync(path, {
            encoding: "utf-8",
        });
        current = JSON.parse(currentRaw);
    }
    catch (e) {
        node_fs_1.default.writeFileSync(path, JSON.stringify(current));
    }
    const newData = (0, utils_1.sortObjByKeys)({
        ...(current ?? {}),
        ...data,
    });
    node_fs_1.default.writeFileSync(path, JSON.stringify(data, null, 2));
    return newData;
};
class FilesystemDatabaseHandler extends DatabaseHandler_1.default {
    async init() {
        console.log("Init FilesystemDb");
        if (!node_fs_1.default.existsSync(constants_1.PATHS.tickers)) {
            return !!node_fs_1.default.mkdirSync(constants_1.PATHS.tickers, { recursive: true });
        }
        return true;
    }
    getTickerHandlers(tickerId) {
        throw new Error("Method not implemented.");
    }
    async saveTickerError(ticker, error) {
        try {
            if (!ticker.id)
                throw Error(`[saveTickerError] Invalid ticker not in database: ${ticker.symbol}, Skipping...`);
            const storedTicker = await this.getTicker(ticker.symbol);
            storedTicker.saveError(error);
            return true;
        }
        catch (e) {
            console.log(picocolors_1.default.red(e));
            return false;
        }
    }
    addTicker(symbol) {
        throw new Error("Method not implemented.");
    }
    async getTicker(symbol) {
        const tickerFile = constants_1.PATHS.tickerFile(symbol);
        if (!node_fs_1.default.existsSync(tickerFile))
            return;
        return new tickerModel_1.default(JSON.parse(node_fs_1.default.readFileSync(tickerFile, "utf-8")));
    }
    async getRawTicker(symbol) {
        const tickerFile = constants_1.PATHS.rawFile(symbol);
        console.log(tickerFile);
        if (!node_fs_1.default.existsSync(tickerFile))
            return;
        // const rawData = fs.readFileSync(tickerFile, "utf-8");
        const rawData = await readAndDecompressFile(tickerFile);
        return rawData;
    }
    async getTickers() {
        const list = await this.getTickersList();
        const data = [];
        for (let i = 0; i < list.length; i++) {
            const symbol = list[i];
            const ticker = await this.getTicker(symbol);
            ticker && data.push(ticker);
        }
        console.log(data);
        //TODO: check this
        return data;
    }
    async getTickersList() {
        return node_fs_1.default
            .readdirSync(constants_1.PATHS.tickers)
            .filter((st) => node_path_1.default.basename(st) !== ".gitignore")
            .map((filePath) => node_path_1.default.basename(filePath, node_path_1.default.extname(filePath)));
    }
    async saveTicker(ticker) {
        try {
            if (Object.keys(ticker).length < 1)
                throw Error(picocolors_1.default.yellow(`Data was not provider to save [${ticker.symbol}]`));
            if (!ticker.updatedAt)
                ticker.updatedAt = new Date();
            const newData = (0, utils_1.sortObjByKeys)({
                ...ticker,
                updatedAt: (0, utils_1.formatDate)((0, dayjs_1.default)(new Date())),
            });
            await updateOrCreate(constants_1.PATHS.tickerFile(ticker.symbol), newData);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async saveRaw(handler, symbol, data) {
        let current = {};
        try {
            current = readAndDecompressFile(constants_1.PATHS.rawFile(symbol));
            // const currentRaw =
            // fs.readFileSync(PATHS.rawFile(symbol), {
            //   encoding: "utf-8",
            // });
            // current = JSON.parse(currentRaw);
        }
        catch (e) {
            await compressAndWriteFile(constants_1.PATHS.rawFile(symbol), current);
            // fs.writeFileSync(PATHS.rawFile(symbol), JSON.stringify(current));
        }
        console.log("saveRaw current:", Object.keys(current));
        const newData = {
            ...(current ?? {}),
            [handler]: data,
        };
        compressAndWriteFile(constants_1.PATHS.rawFile(symbol), newData);
        //fs.writeFileSync(PATHS.rawFile(symbol), JSON.stringify(newData, null, 2));
    }
}
exports.default = FilesystemDatabaseHandler;
