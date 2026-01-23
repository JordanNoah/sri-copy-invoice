"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronJobSequelize = void 0;
const sequelize_1 = require("sequelize");
const crypto_1 = require("crypto");
const sequelize_2 = __importDefault(require("@/infrastructure/database/sequelize"));
class CronJobSequelize extends sequelize_1.Model {
}
exports.CronJobSequelize = CronJobSequelize;
CronJobSequelize.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: "ID único autoincrementable",
    },
    jobUuid: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: () => (0, crypto_1.randomUUID)(),
        allowNull: false,
        comment: "UUID único del cronjob",
    },
    schedule: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        comment: 'Expresión cron (ej: "0 0 * * *" para cada día a medianoche)',
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: "Descripción del propósito del cronjob",
    },
    executablePath: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        comment: "Ruta del archivo ejecutable o función a ejecutar",
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "Indica si el cronjob está activo o pausado",
    },
    lastExecution: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: "Fecha y hora de la última ejecución",
    },
    nextExecution: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: "Fecha y hora de la próxima ejecución programada",
    },
    executionCount: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Número total de ejecuciones",
    },
    lastError: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: "Mensaje de error de la última ejecución fallida",
    },
}, {
    sequelize: sequelize_2.default,
    tableName: "cron_jobs",
    timestamps: true,
    comment: "Tabla para almacenar y gestionar cronjobs programados",
    indexes: [
        {
            fields: ["jobUuid"],
            unique: true,
        },
        {
            fields: ["isActive"],
        },
        {
            fields: ["createdAt"],
        },
    ],
});
