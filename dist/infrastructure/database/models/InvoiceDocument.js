"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceDocumentSequelize = void 0;
const sequelize_1 = require("sequelize");
const crypto_1 = require("crypto");
const sequelize_2 = __importDefault(require("@/infrastructure/database/sequelize"));
class InvoiceDocumentSequelize extends sequelize_1.Model {
}
exports.InvoiceDocumentSequelize = InvoiceDocumentSequelize;
InvoiceDocumentSequelize.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    documentUuid: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: () => (0, crypto_1.randomUUID)(),
        allowNull: false,
    },
    invoiceUuid: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        comment: "FK a la factura padre",
    },
    fileName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        comment: "Nombre original del archivo (ej: factura_123.xml)",
    },
    s3Key: {
        type: sequelize_1.DataTypes.STRING(512),
        allowNull: false,
        unique: true,
        comment: "Clave única en S3 (files/RUC/YEAR/FILENAME)",
    },
    s3Url: {
        type: sequelize_1.DataTypes.STRING(512),
        allowNull: false,
        comment: "URL pública del archivo en S3",
    },
    fileType: {
        type: sequelize_1.DataTypes.ENUM("xml", "pdf"),
        allowNull: false,
        comment: "Tipo de documento: xml o pdf",
    },
    fileSize: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        comment: "Tamaño del archivo en bytes",
    },
    uploadDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        comment: "Fecha de subida a S3",
    },
}, {
    sequelize: sequelize_2.default,
    tableName: "invoice_documents",
    timestamps: true,
    indexes: [
        {
            fields: ["invoiceUuid"],
            name: "idx_invoice_documents_invoice_uuid",
        },
        {
            fields: ["s3Key"],
            unique: true,
            name: "idx_invoice_documents_s3_key",
        },
        {
            fields: ["fileType"],
            name: "idx_invoice_documents_file_type",
        },
    ],
});
