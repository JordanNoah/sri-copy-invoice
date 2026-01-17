export interface Invoice {
  id: number;
  invoiceUuid: string;
  companyUuid: string;
  invoiceNumber: string;
  invoiceDate: Date;
  amount?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
