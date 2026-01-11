import { DataTypes, Model } from "sequelize";
import { randomUUID } from "crypto";
import sequelize from "@/infrastructure/database/sequelize";

export interface CronJobAttributes {
  id?: number;
  jobUuid: string;
  schedule: string;
  description?: string;
  executablePath: string;
  isActive: boolean;
  lastExecution?: Date;
  nextExecution?: Date;
  executionCount?: number;
  lastError?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CronJobSequelize extends Model<CronJobAttributes, Omit<CronJobAttributes, "id">> {
  declare id: number;
  declare jobUuid: string;
  declare schedule: string;
  declare description?: string;
  declare executablePath: string;
  declare isActive: boolean;
  declare lastExecution?: Date;
  declare nextExecution?: Date;
  declare executionCount?: number;
  declare lastError?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

CronJobSequelize.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: "ID único autoincrementable",
    },
    jobUuid: {
      type: DataTypes.UUID,
      defaultValue: () => randomUUID(),
      allowNull: false,
      unique: true,
      comment: "UUID único del cronjob",
    },
    schedule: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Expresión cron (ej: "0 0 * * *" para cada día a medianoche)',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Descripción del propósito del cronjob",
    },
    executablePath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Ruta del archivo ejecutable o función a ejecutar",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Indica si el cronjob está activo o pausado",
    },
    lastExecution: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Fecha y hora de la última ejecución",
    },
    nextExecution: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Fecha y hora de la próxima ejecución programada",
    },
    executionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Número total de ejecuciones",
    },
    lastError: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Mensaje de error de la última ejecución fallida",
    },
  },
  {
    sequelize,
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
  }
);
