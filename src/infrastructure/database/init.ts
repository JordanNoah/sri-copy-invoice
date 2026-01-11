import { CronJobSequelize } from "./models/CronJob";

export const DbSequelize = async (): Promise<void> => {
    CronJobSequelize.sync({ alter: true });
}