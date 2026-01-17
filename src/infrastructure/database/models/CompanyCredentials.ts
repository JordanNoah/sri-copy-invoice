import { DataTypes, Model } from "sequelize";
import { randomUUID } from "crypto";
import sequelize from "@/infrastructure/database/sequelize";

export interface CompanyCredentialsAttributes {
  id?: number;
  companyUuid: string;
  companyName: string;
  ruc: string;
  username: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CompanyCredentialsSequelize extends Model<
  CompanyCredentialsAttributes,
  Omit<CompanyCredentialsAttributes, "id">
> {
  declare id: number;
  declare companyUuid: string;
  declare companyName: string;
  declare ruc: string;
  declare username: string;
  declare password: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

CompanyCredentialsSequelize.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyUuid: {
      type: DataTypes.UUID,
      defaultValue: () => randomUUID(),
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ruc: {
      type: DataTypes.STRING(13),
      allowNull: false,
      validate: {
        len: [13, 13],
        isNumeric: true,
      },
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "company_credentials",
    timestamps: true,
    indexes: [
      {
        fields: ["ruc"],
        unique: true,
      },
    ],
  }
);
