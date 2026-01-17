import { Invoice } from "@/domain/entity/Invoice";
import { InvoiceDto } from "@/domain/dto/Invoice";

export interface InvoiceRepository {
  create(invoice: InvoiceDto): Promise<Invoice>;
  getById(id: number): Promise<Invoice | null>;
  getByUuid(invoiceUuid: string): Promise<Invoice | null>;
  getByCompanyUuid(companyUuid: string): Promise<Invoice[]>;
  getByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
  getAll(): Promise<Invoice[]>;
  update(id: number, invoice: Partial<InvoiceDto>): Promise<Invoice | null>;
  delete(id: number): Promise<boolean>;
  deleteByCompanyUuid(companyUuid: string): Promise<number>;
}
