"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAssociations = setupAssociations;
const Invoice_1 = require("@/infrastructure/database/models/Invoice");
const InvoiceDocument_1 = require("@/infrastructure/database/models/InvoiceDocument");
const CompanyCredentials_1 = require("@/infrastructure/database/models/CompanyCredentials");
/**
 * Configurar todas las asociaciones entre modelos
 */
function setupAssociations() {
    // Invoice -> InvoiceDocument (1 a muchos)
    Invoice_1.InvoiceSequelize.hasMany(InvoiceDocument_1.InvoiceDocumentSequelize, {
        foreignKey: "invoiceUuid",
        sourceKey: "invoiceUuid",
        as: "documents",
    });
    InvoiceDocument_1.InvoiceDocumentSequelize.belongsTo(Invoice_1.InvoiceSequelize, {
        foreignKey: "invoiceUuid",
        targetKey: "invoiceUuid",
        as: "invoice",
    });
    // CompanyCredentials -> Invoice (1 a muchos)
    CompanyCredentials_1.CompanyCredentialsSequelize.hasMany(Invoice_1.InvoiceSequelize, {
        foreignKey: "companyUuid",
        sourceKey: "companyUuid",
        as: "invoices",
    });
    Invoice_1.InvoiceSequelize.belongsTo(CompanyCredentials_1.CompanyCredentialsSequelize, {
        foreignKey: "companyUuid",
        targetKey: "companyUuid",
        as: "company",
    });
}
