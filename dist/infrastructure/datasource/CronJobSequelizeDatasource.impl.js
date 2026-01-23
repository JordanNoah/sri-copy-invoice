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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronJobSequelizeDatasource = void 0;
const CronJob_datasource_1 = require("@/domain/datasource/CronJob.datasource");
const CronJob_1 = require("@/domain/entity/CronJob");
const CronJob_2 = require("@/domain/dto/CronJob");
const CronJob_3 = require("@/infrastructure/database/models/CronJob");
/**
 * Implementación del datasource de CronJob usando Sequelize
 */
class CronJobSequelizeDatasource extends CronJob_datasource_1.CronJobDatasource {
    /**
     * Crear o actualizar un cronjob (upsert)
     * @param id null para crear, número para actualizar
     */
    upsert(id, cronJobDto) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            if (id === null) {
                // Crear nuevo
                const cronJob = yield CronJob_3.CronJobSequelize.create({
                    jobUuid: cronJobDto.jobUuid,
                    schedule: cronJobDto.schedule,
                    executablePath: cronJobDto.executablePath,
                    isActive: (_a = cronJobDto.isActive) !== null && _a !== void 0 ? _a : true,
                    description: cronJobDto.description,
                    executionCount: 0,
                });
                return this.mapToEntity(cronJob);
            }
            else {
                // Actualizar existente
                const cronJob = yield CronJob_3.CronJobSequelize.findByPk(id);
                if (!cronJob) {
                    throw new Error(`Cronjob con ID ${id} no encontrado`);
                }
                yield cronJob.update({
                    jobUuid: (_b = cronJobDto.jobUuid) !== null && _b !== void 0 ? _b : cronJob.jobUuid,
                    schedule: (_c = cronJobDto.schedule) !== null && _c !== void 0 ? _c : cronJob.schedule,
                    executablePath: (_d = cronJobDto.executablePath) !== null && _d !== void 0 ? _d : cronJob.executablePath,
                    isActive: (_e = cronJobDto.isActive) !== null && _e !== void 0 ? _e : cronJob.isActive,
                    description: (_f = cronJobDto.description) !== null && _f !== void 0 ? _f : cronJob.description,
                    lastExecution: (_g = cronJobDto.lastExecution) !== null && _g !== void 0 ? _g : cronJob.lastExecution,
                    nextExecution: (_h = cronJobDto.nextExecution) !== null && _h !== void 0 ? _h : cronJob.nextExecution,
                    lastError: (_j = cronJobDto.lastError) !== null && _j !== void 0 ? _j : cronJob.lastError,
                });
                return this.mapToEntity(cronJob);
            }
        });
    }
    /**
     * Obtener todos los cronjobs
     */
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const cronJobs = yield CronJob_3.CronJobSequelize.findAll();
            return cronJobs.map((cron) => this.mapToEntity(cron));
        });
    }
    /**
     * Obtener un cronjob por ID
     */
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const cronJob = yield CronJob_3.CronJobSequelize.findByPk(id);
            return cronJob ? this.mapToEntity(cronJob) : null;
        });
    }
    /**
     * Obtener un cronjob por jobUuid
     */
    getByJobUuid(jobUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const cronJob = yield CronJob_3.CronJobSequelize.findOne({ where: { jobUuid } });
            return cronJob ? this.mapToEntity(cronJob) : null;
        });
    }
    /**
     * Obtener todos los cronjobs activos
     */
    getAllActive() {
        return __awaiter(this, void 0, void 0, function* () {
            const cronJobs = yield CronJob_3.CronJobSequelize.findAll({ where: { isActive: true } });
            return cronJobs.map((cron) => this.mapToEntity(cron));
        });
    }
    /**
     * Cambiar el estado activo/inactivo de un cronjob
     */
    toggleStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const cronJob = yield CronJob_3.CronJobSequelize.findByPk(id);
            if (!cronJob) {
                return false;
            }
            yield cronJob.update({ isActive: !cronJob.isActive });
            return true;
        });
    }
    /**
     * Registrar la ejecución de un cronjob
     */
    recordExecution(jobUuid, success, error) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const cronJob = yield CronJob_3.CronJobSequelize.findOne({ where: { jobUuid } });
            if (!cronJob) {
                throw new Error(`Cronjob con UUID ${jobUuid} no encontrado`);
            }
            yield cronJob.update({
                lastExecution: new Date(),
                lastError: error || undefined,
                executionCount: ((_a = cronJob.executionCount) !== null && _a !== void 0 ? _a : 0) + 1,
            });
        });
    }
    /**
     * Eliminar un cronjob
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield CronJob_3.CronJobSequelize.destroy({ where: { id } });
            return result > 0;
        });
    }
    /**
     * Obtener estadísticas de los cronjobs
     */
    getStatistics() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const total = yield CronJob_3.CronJobSequelize.count();
            const active = yield CronJob_3.CronJobSequelize.count({ where: { isActive: true } });
            const inactive = total - active;
            const mostUsed = yield CronJob_3.CronJobSequelize.findOne({
                order: [['executionCount', 'DESC']],
                attributes: ['jobUuid', 'executionCount'],
            });
            return new CronJob_2.CronJobStatisticsDto(total, active, inactive, mostUsed
                ? {
                    jobUuid: mostUsed.jobUuid,
                    executionCount: (_a = mostUsed.executionCount) !== null && _a !== void 0 ? _a : 0,
                }
                : undefined);
        });
    }
    /**
     * Buscar cronjobs por criterios
     */
    search(criteria) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (criteria.isActive !== undefined) {
                where.isActive = criteria.isActive;
            }
            if (criteria.jobUuid) {
                where.jobUuid = criteria.jobUuid;
            }
            const options = { where };
            if (criteria.limit) {
                options.limit = criteria.limit;
            }
            if (criteria.offset) {
                options.offset = criteria.offset;
            }
            const cronJobs = yield CronJob_3.CronJobSequelize.findAll(options);
            return cronJobs.map((cron) => this.mapToEntity(cron));
        });
    }
    /**
     * Contar total de cronjobs
     */
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return CronJob_3.CronJobSequelize.count();
        });
    }
    /**
     * Mapear modelo de Sequelize a entidad del domain
     */
    mapToEntity(cronJob) {
        return new CronJob_1.CronJobEntity(cronJob.id, cronJob.jobUuid, cronJob.schedule, cronJob.executablePath, cronJob.isActive, cronJob.description, cronJob.lastExecution, cronJob.nextExecution, cronJob.executionCount, cronJob.lastError, cronJob.createdAt, cronJob.updatedAt);
    }
}
exports.CronJobSequelizeDatasource = CronJobSequelizeDatasource;
