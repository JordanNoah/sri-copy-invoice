export interface InvoiceDocumentDto {
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
