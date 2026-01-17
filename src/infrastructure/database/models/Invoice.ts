import { DataTypes, Model } from "sequelize";
import { randomUUID } from "crypto";
import sequelize from "@/infrastructure/database/sequelize";

export interface InvoiceAttributes {
  id?: number;
  invoiceUuid: string;
  companyUuid: string;
  invoiceNumber: string;
  invoiceDate: Date;
  amount?: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class InvoiceSequelize extends Model<
  InvoiceAttributes,
  Omit<InvoiceAttributes, "id">
> {
  declare id: number;
  declare invoiceUuid: string;
  declare companyUuid: string;
  declare invoiceNumber: string;
  declare invoiceDate: Date;
  declare amount?: number;
  declare description?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

InvoiceSequelize.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    invoiceUuid: {
      type: DataTypes.UUID,
      defaultValue: () => randomUUID(),
      allowNull: false,
    },
    companyUuid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    invoiceNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Número de factura del SRI",
    },
    invoiceDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Fecha de emisión de la factura",
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: "Monto total de la factura",
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Descripción de la factura",
    },
  },
  {
    sequelize,
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
  }
);
