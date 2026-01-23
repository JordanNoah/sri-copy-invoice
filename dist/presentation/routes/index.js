"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const sequelize_1 = __importDefault(require("@/infrastructure/database/sequelize"));
const routes_1 = require("./v1/routes");
class AppRoutes {
    get routes() {
        const routes = new hono_1.Hono();
        routes.get("/", (c) => __awaiter(this, void 0, void 0, function* () {
            let dbStatus = false;
            let responseTime = null;
            try {
                const start = performance.now();
                yield sequelize_1.default.query("SELECT NOW()");
                const end = performance.now();
                dbStatus = true;
                responseTime = (end - start) / 1000;
            }
            catch (error) {
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
        }));
        // Rutas V1
        const v1Routes = new routes_1.V1Routes();
        routes.route("/api/v1", v1Routes.routes);
        return routes;
    }
}
exports.default = AppRoutes;
