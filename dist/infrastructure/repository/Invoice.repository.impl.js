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
exports.InvoiceRepositoryImpl = void 0;
class InvoiceRepositoryImpl {
    constructor(datasource) {
        this.datasource = datasource;
    }
    create(invoice) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.create(invoice);
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.getById(id);
        });
    }
    getByUuid(invoiceUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.getByUuid(invoiceUuid);
        });
    }
    getByCompanyUuid(companyUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.getByCompanyUuid(companyUuid);
        });
    }
    getByInvoiceNumber(invoiceNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.getByInvoiceNumber(invoiceNumber);
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.getAll();
        });
    }
    update(id, invoice) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.update(id, invoice);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.delete(id);
        });
    }
    deleteByCompanyUuid(companyUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.datasource.deleteByCompanyUuid(companyUuid);
        });
    }
}
exports.InvoiceRepositoryImpl = InvoiceRepositoryImpl;
