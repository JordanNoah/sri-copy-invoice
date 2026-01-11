import {Options} from 'sequelize'
import ENV from "@/shared/env";

export const configuration: Options = {
    host: ENV.DB_HOST,
    username: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
    benchmark: true,
    logging: false,
    port: ENV.DB_PORT,
    database: ENV.DB_NAME,
    dialect: 'mysql'
}
