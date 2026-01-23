"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceDocumentSequelizeDatasource = void 0;
const InvoiceDocument_1 = require("@/infrastructure/database/models/InvoiceDocument");
class InvoiceDocumentSequelizeDatasource {
    create(document) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield InvoiceDocument_1.InvoiceDocumentSequelize.create(document);
                return this.mapToEntity(result);
            }
            catch (error) {
                console.error("Error creating invoice document:", error);
                throw new Error("Failed to create invoice document");
            }
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield InvoiceDocument_1.InvoiceDocumentSequelize.findByPk(id);
                return result ? this.mapToEntity(result) : null;
            }
            catch (error) {
                console.error("Error getting invoice document by id:", error);
                throw new Error("Failed to get invoice document");
            }
        });
    }
    getByUuid(documentUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield InvoiceDocument_1.InvoiceDocumentSequelize.findOne({
                    where: { documentUuid },
                });
                return result ? this.mapToEntity(result) : null;
            }
            catch (error) {
                console.error("Error getting invoice document by uuid:", error);
                throw new Error("Failed to get invoice document");
            }
        });
    }
    getByInvoiceUuid(invoiceUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield InvoiceDocument_1.InvoiceDocumentSequelize.findAll({
                    where: { invoiceUuid },
                    order: [["fileType", "ASC"]],
                });
                return results.map((result) => this.mapToEntity(result));
            }
            catch (error) {
                console.error("Error getting invoice documents by invoice uuid:", error);
                throw new Error("Failed to get invoice documents");
            }
        });
    }
    getByS3Key(s3Key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield InvoiceDocument_1.InvoiceDocumentSequelize.findOne({
                    where: { s3Key },
                });
                return result ? this.mapToEntity(result) : null;
            }
            catch (error) {
                console.error("Error getting invoice document by s3 key:", error);
                throw new Error("Failed to get invoice document");
            }
        });
    }
    getByInvoiceUuidAndFileType(invoiceUuid, fileType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield InvoiceDocument_1.InvoiceDocumentSequelize.findOne({
                    where: { invoiceUuid, fileType },
                });
                return result ? this.mapToEntity(result) : null;
            }
            catch (error) {
                console.error("Error getting invoice document by invoice uuid and file type:", error);
                throw new Error("Failed to get invoice document");
            }
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield InvoiceDocument_1.InvoiceDocumentSequelize.findAll({
                    order: [["uploadDate", "DESC"]],
                });
                return results.map((result) => this.mapToEntity(result));
            }
            catch (error) {
                console.error("Error getting all invoice documents:", error);
                throw new Error("Failed to get invoice documents");
            }
        });
    }
    update(id, document) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield InvoiceDocument_1.InvoiceDocumentSequelize.findByPk(id);
                if (!result)
                    return null;
                yield result.update(document);
                return this.mapToEntity(result);
            }
            catch (error) {
                console.error("Error updating invoice document:", error);
                throw new Error("Failed to update invoice document");
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield InvoiceDocument_1.InvoiceDocumentSequelize.destroy({
                    where: { id },
                });
                return result > 0;
            }
            catch (error) {
                console.error("Error deleting invoice document:", error);
                throw new Error("Failed to delete invoice document");
            }
        });
    }
    deleteByInvoiceUuid(invoiceUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield InvoiceDocument_1.InvoiceDocumentSequelize.destroy({
                    where: { invoiceUuid },
                });
            }
            catch (error) {
                console.error("Error deleting invoice documents by invoice uuid:", error);
                throw new Error("Failed to delete invoice documents");
            }
        });
    }
    mapToEntity(sequelize) {
        return {
            id: sequelize.id,
            documentUuid: sequelize.documentUuid,
            invoiceUuid: sequelize.invoiceUuid,
            fileName: sequelize.fileName,
            s3Key: sequelize.s3Key,
            s3Url: sequelize.s3Url,
            fileType: sequelize.fileType,
            fileSize: sequelize.fileSize,
            uploadDate: sequelize.uploadDate,
            createdAt: sequelize.createdAt,
            updatedAt: sequelize.updatedAt,
        };
    }
}
exports.InvoiceDocumentSequelizeDatasource = InvoiceDocumentSequelizeDatasource;
