import { InvoiceRepository } from "@/domain/repository/Invoice.repository";
import { Invoice } from "@/domain/entity/Invoice";
import { InvoiceDto } from "@/domain/dto/Invoice";
import { InvoiceDatasource } from "@/domain/datasource/Invoice.datasource";

export class InvoiceRepositoryImpl implements InvoiceRepository {
  constructor(private datasource: InvoiceDatasource) {}

  async create(invoice: InvoiceDto): Promise<Invoice> {
    return this.datasource.create(invoice);
  }

  async getById(id: number): Promise<Invoice | null> {
    return this.datasource.getById(id);
  }

  async getByUuid(invoiceUuid: string): Promise<Invoice | null> {
    return this.datasource.getByUuid(invoiceUuid);
  }

  async getByCompanyUuid(companyUuid: string): Promise<Invoice[]> {
    return this.datasource.getByCompanyUuid(companyUuid);
  }

  async getByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    return this.datasource.getByInvoiceNumber(invoiceNumber);
  }

  async getAll(): Promise<Invoice[]> {
    return this.datasource.getAll();
  }

  async update(id: number, invoice: Partial<InvoiceDto>): Promise<Invoice | null> {
    return this.datasource.update(id, invoice);
  }

  async delete(id: number): Promise<boolean> {
    return this.datasource.delete(id);
  }

  async deleteByCompanyUuid(companyUuid: string): Promise<number> {
    return this.datasource.deleteByCompanyUuid(companyUuid);
  }
}
