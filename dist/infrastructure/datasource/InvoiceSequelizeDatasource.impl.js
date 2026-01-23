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
exports.InvoiceSequelizeDatasource = void 0;
const Invoice_1 = require("@/infrastructure/database/models/Invoice");
class InvoiceSequelizeDatasource {
    create(invoice) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield Invoice_1.InvoiceSequelize.create(invoice);
                return this.mapToEntity(result);
            }
            catch (error) {
                console.error("Error creating invoice:", error);
                throw new Error("Failed to create invoice");
            }
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield Invoice_1.InvoiceSequelize.findByPk(id);
                return result ? this.mapToEntity(result) : null;
            }
            catch (error) {
                console.error("Error getting invoice by id:", error);
                throw new Error("Failed to get invoice");
            }
        });
    }
    getByUuid(invoiceUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield Invoice_1.InvoiceSequelize.findOne({
                    where: { invoiceUuid },
                });
                return result ? this.mapToEntity(result) : null;
            }
            catch (error) {
                console.error("Error getting invoice by uuid:", error);
                throw new Error("Failed to get invoice");
            }
        });
    }
    getByCompanyUuid(companyUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield Invoice_1.InvoiceSequelize.findAll({
                    where: { companyUuid },
                    order: [["invoiceDate", "DESC"]],
                });
                return results.map((result) => this.mapToEntity(result));
            }
            catch (error) {
                console.error("Error getting invoices by company uuid:", error);
                throw new Error("Failed to get invoices");
            }
        });
    }
    getByInvoiceNumber(invoiceNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield Invoice_1.InvoiceSequelize.findOne({
                    where: { invoiceNumber },
                });
                return result ? this.mapToEntity(result) : null;
            }
            catch (error) {
                console.error("Error getting invoice by number:", error);
                throw new Error("Failed to get invoice");
            }
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield Invoice_1.InvoiceSequelize.findAll({
                    order: [["invoiceDate", "DESC"]],
                });
                return results.map((result) => this.mapToEntity(result));
            }
            catch (error) {
                console.error("Error getting all invoices:", error);
                throw new Error("Failed to get invoices");
            }
        });
    }
    update(id, invoice) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield Invoice_1.InvoiceSequelize.findByPk(id);
                if (!result)
                    return null;
                yield result.update(invoice);
                return this.mapToEntity(result);
            }
            catch (error) {
                console.error("Error updating invoice:", error);
                throw new Error("Failed to update invoice");
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield Invoice_1.InvoiceSequelize.destroy({
                    where: { id },
                });
                return result > 0;
            }
            catch (error) {
                console.error("Error deleting invoice:", error);
                throw new Error("Failed to delete invoice");
            }
        });
    }
    deleteByCompanyUuid(companyUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Invoice_1.InvoiceSequelize.destroy({
                    where: { companyUuid },
                });
            }
            catch (error) {
                console.error("Error deleting invoices by company uuid:", error);
                throw new Error("Failed to delete invoices");
            }
        });
    }
    mapToEntity(sequelize) {
        return {
            id: sequelize.id,
            invoiceUuid: sequelize.invoiceUuid,
            companyUuid: sequelize.companyUuid,
            invoiceNumber: sequelize.invoiceNumber,
            invoiceDate: sequelize.invoiceDate,
            amount: sequelize.amount,
            description: sequelize.description,
            createdAt: sequelize.createdAt,
            updatedAt: sequelize.updatedAt,
        };
    }
}
exports.InvoiceSequelizeDatasource = InvoiceSequelizeDatasource;
