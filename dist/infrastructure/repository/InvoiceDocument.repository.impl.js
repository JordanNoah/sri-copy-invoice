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
exports.InvoiceDocumentRepositoryImpl = void 0;
class InvoiceDocumentRepositoryImpl {
    constructor(datasource) {
        this.datasource = datasource;
    }
    create(document) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.create(document);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.getById(id);
        });
    }
    getByUuid(documentUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.getByUuid(documentUuid);
        });
    }
    getByInvoiceUuid(invoiceUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.getByInvoiceUuid(invoiceUuid);
        });
    }
    getByS3Key(s3Key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.getByS3Key(s3Key);
        });
    }
    getByInvoiceUuidAndFileType(invoiceUuid, fileType) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.getByInvoiceUuidAndFileType(invoiceUuid, fileType);
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.getAll();
        });
    }
    update(id, document) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.update(id, document);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.delete(id);
        });
    }
    deleteByInvoiceUuid(invoiceUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.deleteByInvoiceUuid(invoiceUuid);
        });
    }
}
exports.InvoiceDocumentRepositoryImpl = InvoiceDocumentRepositoryImpl;
