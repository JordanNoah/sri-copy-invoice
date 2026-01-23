import { InvoiceDocumentDatasource } from "@/domain/datasource/InvoiceDocument.datasource";
import { InvoiceDocument } from "@/domain/entity/InvoiceDocument";
import { InvoiceDocumentDto } from "@/domain/dto/InvoiceDocument";
import { InvoiceDocumentSequelize } from "@/infrastructure/database/models/InvoiceDocument";

export class InvoiceDocumentDatasourceImpl implements InvoiceDocumentDatasource
{
  async create(document: InvoiceDocumentDto): Promise<InvoiceDocument> {
    try {
      const result = await InvoiceDocumentSequelize.create(document);
      return this.mapToEntity(result);
    } catch (error) {
      console.error("Error creating invoice document:", error);
      throw new Error("Failed to create invoice document");
    }
  }

  async getById(id: number): Promise<InvoiceDocument | null> {
    try {
      const result = await InvoiceDocumentSequelize.findByPk(id);
      return result ? this.mapToEntity(result) : null;
    } catch (error) {
      console.error("Error getting invoice document by id:", error);
      throw new Error("Failed to get invoice document");
    }
  }

  async getByUuid(documentUuid: string): Promise<InvoiceDocument | null> {
    try {
      const result = await InvoiceDocumentSequelize.findOne({
        where: { documentUuid },
      });
      return result ? this.mapToEntity(result) : null;
    } catch (error) {
      console.error("Error getting invoice document by uuid:", error);
      throw new Error("Failed to get invoice document");
    }
  }

  async getByInvoiceUuid(invoiceUuid: string): Promise<InvoiceDocument[]> {
    try {
      const results = await InvoiceDocumentSequelize.findAll({
        where: { invoiceUuid },
        order: [["fileType", "ASC"]],
      });
      return results.map((result) => this.mapToEntity(result));
    } catch (error) {
      console.error("Error getting invoice documents by invoice uuid:", error);
      throw new Error("Failed to get invoice documents");
    }
  }

  async getByS3Key(s3Key: string): Promise<InvoiceDocument | null> {
    try {
      const result = await InvoiceDocumentSequelize.findOne({
        where: { s3Key },
      });
      return result ? this.mapToEntity(result) : null;
    } catch (error) {
      console.error("Error getting invoice document by s3 key:", error);
      throw new Error("Failed to get invoice document");
    }
  }

  async getByInvoiceUuidAndFileType(
    invoiceUuid: string,
    fileType: "xml" | "pdf"
  ): Promise<InvoiceDocument | null> {
    try {
      const result = await InvoiceDocumentSequelize.findOne({
        where: { invoiceUuid, fileType },
      });
      return result ? this.mapToEntity(result) : null;
    } catch (error) {
      console.error(
        "Error getting invoice document by invoice uuid and file type:",
        error
      );
      throw new Error("Failed to get invoice document");
    }
  }

  async getAll(): Promise<InvoiceDocument[]> {
    try {
      const results = await InvoiceDocumentSequelize.findAll({
        order: [["uploadDate", "DESC"]],
      });
      return results.map((result) => this.mapToEntity(result));
    } catch (error) {
      console.error("Error getting all invoice documents:", error);
      throw new Error("Failed to get invoice documents");
    }
  }

  async update(
    id: number,
    document: Partial<InvoiceDocumentDto>
  ): Promise<InvoiceDocument | null> {
    try {
      const result = await InvoiceDocumentSequelize.findByPk(id);
      if (!result) return null;

      await result.update(document);
      return this.mapToEntity(result);
    } catch (error) {
      console.error("Error updating invoice document:", error);
      throw new Error("Failed to update invoice document");
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await InvoiceDocumentSequelize.destroy({
        where: { id },
      });
      return result > 0;
    } catch (error) {
      console.error("Error deleting invoice document:", error);
      throw new Error("Failed to delete invoice document");
    }
  }

  async deleteByInvoiceUuid(invoiceUuid: string): Promise<number> {
    try {
      return await InvoiceDocumentSequelize.destroy({
        where: { invoiceUuid },
      });
    } catch (error) {
      console.error(
        "Error deleting invoice documents by invoice uuid:",
        error
      );
      throw new Error("Failed to delete invoice documents");
    }
  }

  private mapToEntity(sequelize: InvoiceDocumentSequelize): InvoiceDocument {
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
