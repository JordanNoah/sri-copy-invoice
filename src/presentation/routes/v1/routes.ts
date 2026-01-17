import { Hono } from "hono";
import { CompanyRoutes } from "./company/routes";

export class V1Routes {
    public get routes(): Hono {
        const router = new Hono();
        
        // Rutas de company
        const companyRoutes = new CompanyRoutes();
        router.route("/company", companyRoutes.routes);
        
        return router;
    }
}
