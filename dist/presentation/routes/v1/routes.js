"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V1Routes = void 0;
const hono_1 = require("hono");
const routes_1 = require("./company/routes");
class V1Routes {
    get routes() {
        const router = new hono_1.Hono();
        // Rutas de company
        const companyRoutes = new routes_1.CompanyRoutes();
        router.route("/company", companyRoutes.routes);
        return router;
    }
}
exports.V1Routes = V1Routes;
