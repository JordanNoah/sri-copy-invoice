import { CronJobSequelize } from "./models/CronJob";
import { CompanyCredentialsSequelize } from "./models/CompanyCredentials";
import { InvoiceSequelize } from "./models/Invoice";
import { InvoiceDocumentSequelize } from "./models/InvoiceDocument";
import { setupAssociations } from "./associations";

export const DbSequelize = async (): Promise<void> => {
    await CronJobSequelize.sync({ alter: true });
    await CompanyCredentialsSequelize.sync({ alter: true });
    await InvoiceSequelize.sync({ alter: true });
    await InvoiceDocumentSequelize.sync({ alter: true });
    setupAssociations();
}