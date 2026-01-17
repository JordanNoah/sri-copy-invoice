import { InvoiceDocument } from "@/domain/entity/InvoiceDocument";
import { InvoiceDocumentDto } from "@/domain/dto/InvoiceDocument";

export interface InvoiceDocumentRepository {
  create(document: InvoiceDocumentDto): Promise<InvoiceDocument>;
  getById(id: number): Promise<InvoiceDocument | null>;
  getByUuid(documentUuid: string): Promise<InvoiceDocument | null>;
  getByInvoiceUuid(invoiceUuid: string): Promise<InvoiceDocument[]>;
  getByS3Key(s3Key: string): Promise<InvoiceDocument | null>;
  getByInvoiceUuidAndFileType(
    invoiceUuid: string,
    fileType: "xml" | "pdf"
  ): Promise<InvoiceDocument | null>;
  getAll(): Promise<InvoiceDocument[]>;
  update(
    id: number,
    document: Partial<InvoiceDocumentDto>
  ): Promise<InvoiceDocument | null>;
  delete(id: number): Promise<boolean>;
  deleteByInvoiceUuid(invoiceUuid: string): Promise<number>;
}
