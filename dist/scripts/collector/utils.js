"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.loadIndex = loadIndex;
exports.saveIndex = saveIndex;
exports.ensureDir = ensureDir;
exports.generateProductId = generateProductId;
exports.extractTmallId = extractTmallId;
exports.formatDuration = formatDuration;
exports.logInfo = logInfo;
exports.logSuccess = logSuccess;
exports.logWarn = logWarn;
exports.logError = logError;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/** 默认采集配置 */
exports.DEFAULT_CONFIG = {
    keywords: ["紫砂壶", "宜兴紫砂壶", "紫砂茶壶", "手工紫砂壶"],
    maxProducts: 20,
    headless: false,
    minDelay: 2000,
    maxDelay: 5000,
    timeout: 30000,
    outputDir: path.resolve(process.cwd(), "data", "raw_products"),
};
/** 加载现有采集索引（增量采集用） */
function loadIndex(outputDir) {
    const indexPath = path.join(outputDir, ".index.json");
    if (fs.existsSync(indexPath)) {
        try {
            const raw = fs.readFileSync(indexPath, "utf-8");
            return JSON.parse(raw);
        }
        catch (_a) {
            console.warn("[utils] 索引文件损坏，重置索引");
        }
    }
    return {
        lastUpdated: new Date().toISOString(),
        collectedIds: [],
        totalCollected: 0,
    };
}
/** 保存采集索引 */
function saveIndex(outputDir, index) {
    const indexPath = path.join(outputDir, ".index.json");
    index.lastUpdated = new Date().toISOString();
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf-8");
}
/** 确保输出目录存在 */
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
/** 生成 12 位随机 ID（与现有 ID 格式兼容） */
function generateProductId() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for (let i = 0; i < 12; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}
/** 从链接提取天猫商品 ID */
function extractTmallId(url) {
    const match = url.match(/id=(\d+)/);
    return match ? match[1] : null;
}
/** 格式化耗时 */
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
        return `${minutes}分${seconds % 60}秒`;
    }
    return `${seconds}秒`;
}
/** 控制台分色输出 */
function logInfo(msg) {
    console.log(`[INFO] ${msg}`);
}
function logSuccess(msg) {
    console.log(`[OK]   ${msg}`);
}
function logWarn(msg) {
    console.log(`[WARN] ${msg}`);
}
function logError(msg) {
    console.log(`[ERR]  ${msg}`);
}
