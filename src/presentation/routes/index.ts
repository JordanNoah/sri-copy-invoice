import {Hono} from "hono";
import sequelize from "@/infrastructure/database/sequelize";
import { V1Routes } from "./v1/routes";

export default class AppRoutes {
    public get routes(): Hono {
        const routes = new Hono();
        
        routes.get("/", async (c) => {
            let dbStatus = false;
            let responseTime = null;

            try {
                const start = performance.now();
                await sequelize.query("SELECT NOW()");
                const end = performance.now();
                dbStatus = true;
                responseTime = (end - start) / 1000;
            } catch (error) {
                console.error("DB connection failed:", error);
                dbStatus = false;
            }
            return c.json({
                info: {
                    Title: 'SRI - serverless cronjob manager',
                    Version: '1.0.0',
                    Author: 'Jordan Ubilla Mendoza',
                },
                quote: "Hello world",
                db: {
                    status: dbStatus,
                    responseTime
                }
            });
        });

        // Rutas V1
        const v1Routes = new V1Routes();
        routes.route("/api/v1", v1Routes.routes);
        
        return routes;
    }
}
