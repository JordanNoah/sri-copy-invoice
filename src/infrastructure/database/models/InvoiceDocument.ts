import { DataTypes, Model } from "sequelize";
import { randomUUID } from "crypto";
import sequelize from "@/infrastructure/database/sequelize";

export interface InvoiceDocumentAttributes {
  id?: number;
  documentUuid: string;
  invoiceUuid: string;
  fileName: string;
  s3Key: string;
  s3Url: string;
  fileType: "xml" | "pdf";
  fileSize: number;
  uploadDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class InvoiceDocumentSequelize extends Model<
  InvoiceDocumentAttributes,
  Omit<InvoiceDocumentAttributes, "id">
> {
  declare id: number;
  declare documentUuid: string;
  declare invoiceUuid: string;
  declare fileName: string;
  declare s3Key: string;
  declare s3Url: string;
  declare fileType: "xml" | "pdf";
  declare fileSize: number;
  declare uploadDate: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

InvoiceDocumentSequelize.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    documentUuid: {
      type: DataTypes.UUID,
      defaultValue: () => randomUUID(),
      allowNull: false,
    },
    invoiceUuid: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
      comment: "FK a la factura padre",
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Nombre original del archivo (ej: factura_123.xml)",
    },
    s3Key: {
      type: DataTypes.STRING(512),
      allowNull: false,
      comment: "Clave única en S3 (files/RUC/YEAR/FILENAME)",
    },
    s3Url: {
      type: DataTypes.STRING(512),
      allowNull: false,
      comment: "URL pública del archivo en S3",
    },
    fileType: {
      type: DataTypes.ENUM("xml", "pdf"),
      allowNull: false,
      comment: "Tipo de documento: xml o pdf",
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "Tamaño del archivo en bytes",
    },
    uploadDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Fecha de subida a S3",
    },
  },
  {
    sequelize,
    tableName: "invoice_documents",
    timestamps: true,
    indexes: [
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
  }
);
