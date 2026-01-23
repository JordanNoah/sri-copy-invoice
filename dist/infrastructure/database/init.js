"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbSequelize = void 0;
const CronJob_1 = require("./models/CronJob");
const CompanyCredentials_1 = require("./models/CompanyCredentials");
const Invoice_1 = require("./models/Invoice");
const InvoiceDocument_1 = require("./models/InvoiceDocument");
const associations_1 = require("./associations");
const DbSequelize = () => __awaiter(void 0, void 0, void 0, function* () {
    yield CronJob_1.CronJobSequelize.sync({ alter: true });
    yield CompanyCredentials_1.CompanyCredentialsSequelize.sync({ alter: true });
    yield Invoice_1.InvoiceSequelize.sync({ alter: true });
    yield InvoiceDocument_1.InvoiceDocumentSequelize.sync({ alter: true });
    (0, associations_1.setupAssociations)();
});
exports.DbSequelize = DbSequelize;
