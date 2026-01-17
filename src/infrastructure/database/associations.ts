import { InvoiceSequelize } from "@/infrastructure/database/models/Invoice";
import { InvoiceDocumentSequelize } from "@/infrastructure/database/models/InvoiceDocument";
import { CompanyCredentialsSequelize } from "@/infrastructure/database/models/CompanyCredentials";

/**
 * Configurar todas las asociaciones entre modelos
 */
export function setupAssociations() {
  // Invoice -> InvoiceDocument (1 a muchos)
  InvoiceSequelize.hasMany(InvoiceDocumentSequelize, {
    foreignKey: "invoiceUuid",
    sourceKey: "invoiceUuid",
    as: "documents",
  });

  InvoiceDocumentSequelize.belongsTo(InvoiceSequelize, {
    foreignKey: "invoiceUuid",
    targetKey: "invoiceUuid",
    as: "invoice",
  });

  // CompanyCredentials -> Invoice (1 a muchos)
  CompanyCredentialsSequelize.hasMany(InvoiceSequelize, {
    foreignKey: "companyUuid",
    sourceKey: "companyUuid",
    as: "invoices",
  });

  InvoiceSequelize.belongsTo(CompanyCredentialsSequelize, {
    foreignKey: "companyUuid",
    targetKey: "companyUuid",
    as: "company",
  });
}
