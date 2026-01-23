"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceSequelize = void 0;
const sequelize_1 = require("sequelize");
const crypto_1 = require("crypto");
const sequelize_2 = __importDefault(require("@/infrastructure/database/sequelize"));
class InvoiceSequelize extends sequelize_1.Model {
}
exports.InvoiceSequelize = InvoiceSequelize;
InvoiceSequelize.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    invoiceUuid: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: () => (0, crypto_1.randomUUID)(),
        allowNull: false,
    },
    companyUuid: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    invoiceNumber: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        comment: "Número de factura del SRI",
    },
    invoiceDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        comment: "Fecha de emisión de la factura",
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: "Monto total de la factura",
    },
    description: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
        comment: "Descripción de la factura",
    },
}, {
    sequelize: sequelize_2.default,
    tableName: "invoices",
    timestamps: true,
    indexes: [
        {
            fields: ["companyUuid"],
            name: "idx_invoices_company_uuid",
        },
        {
            fields: ["invoiceNumber"],
            name: "idx_invoices_invoice_number",
        },
        {
            fields: ["invoiceDate"],
            name: "idx_invoices_invoice_date",
        },
    ],
});
