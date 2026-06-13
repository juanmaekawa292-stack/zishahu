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
exports.saveProduct = saveProduct;
exports.saveProducts = saveProducts;
exports.loadCollectedIds = loadCollectedIds;
exports.exportAllAsArray = exportAllAsArray;
exports.exportAsCSV = exportAsCSV;
exports.loadProduct = loadProduct;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("./utils");
/** 保存单个商品数据为 JSON 文件 */
function saveProduct(outputDir, product) {
    (0, utils_1.ensureDir)(outputDir);
    const filePath = path.join(outputDir, `${product.tmallId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(product, null, 2), "utf-8");
}
/** 批量保存商品并更新索引 */
function saveProducts(outputDir, products) {
    const index = (0, utils_1.loadIndex)(outputDir);
    for (const product of products) {
        saveProduct(outputDir, product);
        if (!index.collectedIds.includes(product.tmallId)) {
            index.collectedIds.push(product.tmallId);
        }
        (0, utils_1.logSuccess)(`已保存: ${product.title} (${product.tmallId})`);
    }
    index.totalCollected = index.collectedIds.length;
    (0, utils_1.saveIndex)(outputDir, index);
    return index;
}
/** 已采集 ID 集合查询（快速查找用） */
function loadCollectedIds(outputDir) {
    const index = (0, utils_1.loadIndex)(outputDir);
    return new Set(index.collectedIds);
}
/** 导出所有已采集数据为 JSON 数组（供前端使用） */
function exportAllAsArray(outputDir) {
    const index = (0, utils_1.loadIndex)(outputDir);
    const products = [];
    for (const id of index.collectedIds) {
        const filePath = path.join(outputDir, `${id}.json`);
        if (fs.existsSync(filePath)) {
            try {
                const raw = fs.readFileSync(filePath, "utf-8");
                products.push(JSON.parse(raw));
            }
            catch (e) {
                (0, utils_1.logWarn)(`读取 ${id}.json 失败，跳过`);
            }
        }
    }
    return products;
}
/** 导出为 CSV 文件（供运营分析用） */
function exportAsCSV(outputDir, csvPath) {
    const products = exportAllAsArray(outputDir);
    if (products.length === 0) {
        (0, utils_1.logWarn)("没有数据可导出");
        return;
    }
    const headers = [
        "tmallId", "title", "price", "originalPrice",
        "salesCount", "reviewCount", "shopName", "productUrl",
        "category", "collectedAt",
    ];
    const rows = products.map((p) => headers
        .map((h) => {
        var _a;
        const val = (_a = p[h]) !== null && _a !== void 0 ? _a : "";
        const str = String(val);
        // 转义 CSV
        return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
    })
        .join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    fs.writeFileSync(csvPath, "\uFEFF" + csv, "utf-8"); // BOM for Excel
    (0, utils_1.logSuccess)(`CSV 已导出: ${csvPath} (${products.length} 条)`);
}
/** 加载单个商品 */
function loadProduct(outputDir, tmallId) {
    const filePath = path.join(outputDir, `${tmallId}.json`);
    if (!fs.existsSync(filePath))
        return null;
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    catch (_a) {
        return null;
    }
}
