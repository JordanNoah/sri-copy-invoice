"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyCredentialsSequelize = void 0;
const sequelize_1 = require("sequelize");
const crypto_1 = require("crypto");
const sequelize_2 = __importDefault(require("@/infrastructure/database/sequelize"));
class CompanyCredentialsSequelize extends sequelize_1.Model {
}
exports.CompanyCredentialsSequelize = CompanyCredentialsSequelize;
CompanyCredentialsSequelize.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    companyUuid: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: () => (0, crypto_1.randomUUID)(),
        allowNull: false,
    },
    companyName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    ruc: {
        type: sequelize_1.DataTypes.STRING(13),
        allowNull: false,
        validate: {
            len: [13, 13],
            isNumeric: true,
        },
    },
    username: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    sequelize: sequelize_2.default,
    tableName: "company_credentials",
    timestamps: true,
    indexes: [
        {
            fields: ["ruc"],
            unique: true,
        },
    ],
});
