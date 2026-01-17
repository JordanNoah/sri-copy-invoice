import { InvoiceDatasource } from "@/domain/datasource/Invoice.datasource";
import { Invoice } from "@/domain/entity/Invoice";
import { InvoiceDto } from "@/domain/dto/Invoice";
import { InvoiceSequelize } from "@/infrastructure/database/models/Invoice";

export class InvoiceSequelizeDatasource implements InvoiceDatasource {
  async create(invoice: InvoiceDto): Promise<Invoice> {
    try {
      const result = await InvoiceSequelize.create(invoice);
      return this.mapToEntity(result);
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw new Error("Failed to create invoice");
    }
  }

  async getById(id: number): Promise<Invoice | null> {
    try {
      const result = await InvoiceSequelize.findByPk(id);
      return result ? this.mapToEntity(result) : null;
    } catch (error) {
      console.error("Error getting invoice by id:", error);
      throw new Error("Failed to get invoice");
    }
  }

  async getByUuid(invoiceUuid: string): Promise<Invoice | null> {
    try {
      const result = await InvoiceSequelize.findOne({
        where: { invoiceUuid },
      });
      return result ? this.mapToEntity(result) : null;
    } catch (error) {
      console.error("Error getting invoice by uuid:", error);
      throw new Error("Failed to get invoice");
    }
  }

  async getByCompanyUuid(companyUuid: string): Promise<Invoice[]> {
    try {
      const results = await InvoiceSequelize.findAll({
        where: { companyUuid },
        order: [["invoiceDate", "DESC"]],
      });
      return results.map((result) => this.mapToEntity(result));
    } catch (error) {
      console.error("Error getting invoices by company uuid:", error);
      throw new Error("Failed to get invoices");
    }
  }

  async getByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    try {
      const result = await InvoiceSequelize.findOne({
        where: { invoiceNumber },
      });
      return result ? this.mapToEntity(result) : null;
    } catch (error) {
      console.error("Error getting invoice by number:", error);
      throw new Error("Failed to get invoice");
    }
  }

  async getAll(): Promise<Invoice[]> {
    try {
      const results = await InvoiceSequelize.findAll({
        order: [["invoiceDate", "DESC"]],
      });
      return results.map((result) => this.mapToEntity(result));
    } catch (error) {
      console.error("Error getting all invoices:", error);
      throw new Error("Failed to get invoices");
    }
  }

  async update(
    id: number,
    invoice: Partial<InvoiceDto>
  ): Promise<Invoice | null> {
    try {
      const result = await InvoiceSequelize.findByPk(id);
      if (!result) return null;

      await result.update(invoice);
      return this.mapToEntity(result);
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw new Error("Failed to update invoice");
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await InvoiceSequelize.destroy({
        where: { id },
      });
      return result > 0;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw new Error("Failed to delete invoice");
    }
  }

  async deleteByCompanyUuid(companyUuid: string): Promise<number> {
    try {
      return await InvoiceSequelize.destroy({
        where: { companyUuid },
      });
    } catch (error) {
      console.error("Error deleting invoices by company uuid:", error);
      throw new Error("Failed to delete invoices");
    }
  }

  private mapToEntity(sequelize: InvoiceSequelize): Invoice {
    return {
      id: sequelize.id,
      invoiceUuid: sequelize.invoiceUuid,
      companyUuid: sequelize.companyUuid,
      invoiceNumber: sequelize.invoiceNumber,
      invoiceDate: sequelize.invoiceDate,
      amount: sequelize.amount,
      description: sequelize.description,
      createdAt: sequelize.createdAt,
      updatedAt: sequelize.updatedAt,
    };
  }
}
