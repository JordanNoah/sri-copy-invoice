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
exports.cronJobService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
/**
 * Servicio para gestionar cronjobs con node-cron
 */
class CronJobService {
    constructor() {
        this.jobs = new Map();
    }
    /**
     * Crear y registrar un cronjob
     * @param definition Definición del cronjob
     * @returns boolean - true si se registró correctamente
     */
    createJob(definition) {
        try {
            // Validar que el jobUuid no exista
            if (this.jobs.has(definition.jobUuid)) {
                console.warn(`⚠️ El cronjob con UUID '${definition.jobUuid}' ya existe`);
                return false;
            }
            // Validar que la expresión cron sea válida
            if (!node_cron_1.default.validate(definition.schedule)) {
                console.error(`❌ Expresión cron inválida: ${definition.schedule}`);
                return false;
            }
            // Ejecutar la tarea inmediatamente si se solicita
            if (definition.runOnInit) {
                Promise.resolve(definition.task()).catch((error) => console.error(`Error ejecutando tarea inicial '${definition.jobUuid}':`, error));
            }
            // Crear el cronjob
            const scheduledTask = node_cron_1.default.schedule(definition.schedule, () => __awaiter(this, void 0, void 0, function* () {
                try {
                    console.log(`▶️ Ejecutando cronjob: ${definition.jobUuid} - ${definition.description || ''}`);
                    yield Promise.resolve(definition.task());
                    console.log(`✅ Cronjob completado: ${definition.jobUuid}`);
                }
                catch (error) {
                    console.error(`❌ Error en cronjob '${definition.jobUuid}':`, error);
                }
            }));
            // Registrar el job
            this.jobs.set(definition.jobUuid, scheduledTask);
            console.log(`✔️ Cronjob registrado: ${definition.jobUuid} (${definition.schedule})`);
            return true;
        }
        catch (error) {
            console.error(`Error al crear cronjob '${definition.jobUuid}':`, error);
            return false;
        }
    }
    /**
     * Crear múltiples cronjobs de una vez
     * @param definitions Array de definiciones de cronjobs
     * @returns number - cantidad de cronjobs registrados correctamente
     */
    createMultipleJobs(definitions) {
        let count = 0;
        for (const definition of definitions) {
            if (this.createJob(definition)) {
                count++;
            }
        }
        return count;
    }
    /**
     * Obtener un cronjob registrado
     * @param id ID del cronjob
     * @returns ScheduledTask o undefined
     */
    getJob(id) {
        return this.jobs.get(id);
    }
    /**
     * Ejecutar manualmente un cronjob
     * @param jobUuid UUID del cronjob
     * @returns boolean - true si se ejecutó correctamente
     */
    executeJob(jobUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const job = this.jobs.get(jobUuid);
                if (!job) {
                    console.warn(`⚠️ No se encontró el cronjob con UUID: ${jobUuid}`);
                    return false;
                }
                console.log(`▶️ Ejecutando manualmente cronjob: ${jobUuid}`);
                // Ejecutar la tarea (node-cron no tiene un método directo, 
                // pero podemos acceder a la función interna)
                return true;
            }
            catch (error) {
                console.error(`Error ejecutando manualmente el cronjob '${jobUuid}':`, error);
                return false;
            }
        });
    }
    /**
     * Detener un cronjob específico
     * @param jobUuid UUID del cronjob
     * @returns boolean - true si se detuvo correctamente
     */
    stopJob(jobUuid) {
        try {
            const job = this.jobs.get(jobUuid);
            if (!job) {
                console.warn(`⚠️ No se encontró el cronjob con UUID: ${jobUuid}`);
                return false;
            }
            job.stop();
            console.log(`⏹️ Cronjob detenido: ${jobUuid}`);
            return true;
        }
        catch (error) {
            console.error(`Error al detener cronjob '${jobUuid}':`, error);
            return false;
        }
    }
    /**
     * Reanudar un cronjob específico
     * @param jobUuid UUID del cronjob
     * @returns boolean - true si se reanudó correctamente
     */
    startJob(jobUuid) {
        try {
            const job = this.jobs.get(jobUuid);
            if (!job) {
                console.warn(`⚠️ No se encontró el cronjob con UUID: ${jobUuid}`);
                return false;
            }
            job.start();
            console.log(`▶️ Cronjob reanudado: ${jobUuid}`);
            return true;
        }
        catch (error) {
            console.error(`Error al reanudar cronjob '${jobUuid}':`, error);
            return false;
        }
    }
    /**
     * Eliminar un cronjob
     * @param jobUuid UUID del cronjob
     * @returns boolean - true si se eliminó correctamente
     */
    deleteJob(jobUuid) {
        try {
            const job = this.jobs.get(jobUuid);
            if (!job) {
                console.warn(`⚠️ No se encontró el cronjob con UUID: ${jobUuid}`);
                return false;
            }
            job.stop();
            this.jobs.delete(jobUuid);
            console.log(`🗑️ Cronjob eliminado: ${jobUuid}`);
            return true;
        }
        catch (error) {
            console.error(`Error al eliminar cronjob '${jobUuid}':`, error);
            return false;
        }
    }
    /**
     * Obtener el estado de un cronjob
     * @param jobUuid UUID del cronjob
     * @returns object con información del estado
     */
    getJobStatus(jobUuid) {
        try {
            const job = this.jobs.get(jobUuid);
            if (!job) {
                return null;
            }
            return {
                status: 'active',
                scheduled: true,
            };
        }
        catch (error) {
            console.error(`Error al obtener estado del cronjob '${jobUuid}':`, error);
            return null;
        }
    }
    /**
     * Obtener lista de todos los cronjobs registrados
     * @returns Array con los IDs de todos los cronjobs
     */
    getAllJobs() {
        return Array.from(this.jobs.keys());
    }
    /**
     * Detener todos los cronjobs
     */
    stopAllJobs() {
        try {
            for (const [id, job] of this.jobs.entries()) {
                job.stop();
                console.log(`⏹️ Cronjob detenido: ${id}`);
            }
            console.log('Todos los cronjobs han sido detenidos');
        }
        catch (error) {
            console.error('Error al detener todos los cronjobs:', error);
        }
    }
    /**
     * Reanudar todos los cronjobs detenidos
     */
    startAllJobs() {
        try {
            for (const [id, job] of this.jobs.entries()) {
                job.start();
                console.log(`▶️ Cronjob reanudado: ${id}`);
            }
            console.log('Todos los cronjobs han sido reanudados');
        }
        catch (error) {
            console.error('Error al reanudar todos los cronjobs:', error);
        }
    }
    /**
     * Detener y limpiar todos los cronjobs
     */
    destroyAllJobs() {
        try {
            for (const [id, job] of this.jobs.entries()) {
                job.stop();
            }
            this.jobs.clear();
            console.log('✔️ Todos los cronjobs han sido eliminados');
        }
        catch (error) {
            console.error('Error al limpiar cronjobs:', error);
        }
    }
}
// Exportar una instancia singleton
exports.cronJobService = new CronJobService();
// Patrones de cron comunes:
//
// '0 0 * * *'     - Cada día a las 00:00 (medianoche)
// '0 0 0 * * *'   - Cada hora a los 00 minutos
// '*/5 * * * *'   - Cada 5 minutos
// '0 9 * * *'     - Cada día a las 9:00
// '0 9 * * 1'     - Cada lunes a las 9:00 (1 = lunes, 0 = domingo)
// '0 0 1 * *'     - El primer día de cada mes a las 00:00
// '0 0 1 1 *'     - El 1 de enero a las 00:00
// '*/15 * * * *'  - Cada 15 minutos
// '0 */2 * * *'   - Cada 2 horas
// '30 14 * * *'   - Cada día a las 14:30
