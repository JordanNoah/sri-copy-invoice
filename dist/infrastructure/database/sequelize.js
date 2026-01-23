"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const configuration_1 = require("./configuration");
const moment_1 = __importDefault(require("moment"));
const sequelize = new sequelize_1.Sequelize(configuration_1.configuration);
sequelize.addHook('afterFind', (result, _options) => {
    const formatDates = (record) => {
        const data = record.dataValues;
        for (const key in data) {
            if (data[key] instanceof Date) {
                data[key] = (0, moment_1.default)(data[key]).format('DD/MM/YYYY');
            }
        }
    };
    if (Array.isArray(result)) {
        result.forEach(record => {
            if (record)
                formatDates(record);
        });
    }
    else if (result) {
        formatDates(result);
    }
});
exports.default = sequelize;
