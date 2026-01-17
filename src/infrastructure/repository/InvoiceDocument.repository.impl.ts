import { InvoiceDocumentRepository } from "@/domain/repository/InvoiceDocument.repository";
import { InvoiceDocument } from "@/domain/entity/InvoiceDocument";
import { InvoiceDocumentDto } from "@/domain/dto/InvoiceDocument";
import { InvoiceDocumentDatasource } from "@/domain/datasource/InvoiceDocument.datasource";

export class InvoiceDocumentRepositoryImpl
  implements InvoiceDocumentRepository
{
  constructor(private datasource: InvoiceDocumentDatasource) {}

  async create(document: InvoiceDocumentDto): Promise<InvoiceDocument> {
    return this.datasource.create(document);
  }

  async getById(id: number): Promise<InvoiceDocument | null> {
    return this.datasource.getById(id);
  }

  async getByUuid(documentUuid: string): Promise<InvoiceDocument | null> {
    return this.datasource.getByUuid(documentUuid);
  }

  async getByInvoiceUuid(invoiceUuid: string): Promise<InvoiceDocument[]> {
    return this.datasource.getByInvoiceUuid(invoiceUuid);
  }

  async getByS3Key(s3Key: string): Promise<InvoiceDocument | null> {
    return this.datasource.getByS3Key(s3Key);
  }

  async getByInvoiceUuidAndFileType(
    invoiceUuid: string,
    fileType: "xml" | "pdf"
  ): Promise<InvoiceDocument | null> {
    return this.datasource.getByInvoiceUuidAndFileType(invoiceUuid, fileType);
  }

  async getAll(): Promise<InvoiceDocument[]> {
    return this.datasource.getAll();
  }

  async update(
    id: number,
    document: Partial<InvoiceDocumentDto>
  ): Promise<InvoiceDocument | null> {
    return this.datasource.update(id, document);
  }

  async delete(id: number): Promise<boolean> {
    return this.datasource.delete(id);
  }

  async deleteByInvoiceUuid(invoiceUuid: string): Promise<number> {
    return this.datasource.deleteByInvoiceUuid(invoiceUuid);
  }
}
