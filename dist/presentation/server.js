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
exports.Server = void 0;
const hono_1 = require("hono");
const env_1 = __importDefault(require("@/shared/env"));
const cors_1 = require("hono/cors");
const node_server_1 = require("@hono/node-server");
const init_1 = require("@/infrastructure/database/init");
const routes_1 = __importDefault(require("./routes"));
const sri_automated_service_1 = require("@/infrastructure/service/sri-automated.service");
class Server {
    constructor() {
        this.app = new hono_1.Hono();
        this.port = env_1.default.PORT;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.time('start server');
                yield (0, init_1.DbSequelize)();
                this.cors();
                this.routes();
                this.server();
                console.timeEnd('start server');
                // Ejecutar proceso automatizado del SRI (solo para debugging)
                // Comentar esta línea en producción
                yield this.runSRIAutomation();
            }
            catch (error) {
                console.error('Error starting server', error);
            }
        });
    }
    routes() {
        this.app.route('/', new routes_1.default().routes);
    }
    cors() {
        this.app.use('*', (c, next) => __awaiter(this, void 0, void 0, function* () {
            const corsMiddleware = (0, cors_1.cors)();
            return yield corsMiddleware(c, next);
        }));
    }
    server() {
        const httpServer = (0, node_server_1.serve)({
            fetch: this.app.fetch,
            port: this.port,
        }, (info) => {
            console.log(`Server is running on port ${info.port}`);
        });
    }
    /**
     * Ejecutar proceso automatizado del SRI
     * Solo para debugging - comentar en producción
     */
    runSRIAutomation() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Esperar 2 segundos después de que el servidor inicie
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    yield (0, sri_automated_service_1.sriAutomatedLogin)();
                }), 2000);
            }
            catch (error) {
                console.error('Error en proceso automatizado del SRI:', error);
            }
        });
    }
}
exports.Server = Server;
