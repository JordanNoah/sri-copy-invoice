import { Context } from "hono";
import { CompanyCredentialsDto } from "@/domain/dto/CompanyCredentials";
import {
  SaveCompanyCredentialsUseCase,
  GetAllCompanyCredentialsUseCase,
  GetCompanyCredentialsByRucUseCase,
  GetDecryptedCredentialsByRucUseCase,
  UpdateCompanyPasswordUseCase,
  DeleteCompanyCredentialsUseCase
} from "@/domain/use-cases/company-credentials";

export class CompanyController {
  constructor(
    private readonly saveCompanyCredentialsUseCase: SaveCompanyCredentialsUseCase,
    private readonly getAllCompanyCredentialsUseCase: GetAllCompanyCredentialsUseCase,
    private readonly getCompanyCredentialsByRucUseCase: GetCompanyCredentialsByRucUseCase,
    private readonly getDecryptedCredentialsByRucUseCase: GetDecryptedCredentialsByRucUseCase,
    private readonly updateCompanyPasswordUseCase: UpdateCompanyPasswordUseCase,
    private readonly deleteCompanyCredentialsUseCase: DeleteCompanyCredentialsUseCase
  ) {}

  /**
   * POST /api/v1/company/credentials
   * Crear o actualizar credenciales (UPSERT)
   */
  saveCredentials = async (c: Context) => {
    try {
      const body = await c.req.json();
      const { companyName, ruc, username, password } = body;

      if (!companyName || !ruc || !username || !password) {
        return c.json(
          {
            error: "Todos los campos son requeridos: companyName, ruc, username, password",
          },
          400
        );
      }

      if (ruc.length !== 13 || !/^\d+$/.test(ruc)) {
        return c.json(
          {
            error: "El RUC debe tener exactamente 13 dígitos numéricos",
          },
          400
        );
      }

      const dto = new CompanyCredentialsDto(companyName, ruc, username, password);
      const result = await this.saveCompanyCredentialsUseCase.execute(dto);

      return c.json(
        {
          message: "Credenciales guardadas exitosamente",
          data: result.toPublicData(),
        },
        201
      );
    } catch (error) {
      console.error("Error saving credentials:", error);
      return c.json(
        {
          error: "Error al guardar credenciales",
          details: error instanceof Error ? error.message : "Error desconocido",
        },
        500
      );
    }
  };

  /**
   * GET /api/v1/company/credentials
   * Obtener todas las credenciales
   */
  getAllCredentials = async (c: Context) => {
    try {
      const credentials = await this.getAllCompanyCredentialsUseCase.execute();

      return c.json({
        message: "Credenciales obtenidas exitosamente",
        data: credentials.map((cred) => cred.toPublicData()),
        count: credentials.length,
      });
    } catch (error) {
      console.error("Error getting all credentials:", error);
      return c.json(
        {
          error: "Error al obtener credenciales",
          details: error instanceof Error ? error.message : "Error desconocido",
        },
        500
      );
    }
  };

  /**
   * GET /api/v1/company/credentials/:ruc
   * Obtener credenciales por RUC (sin contraseña)
   */
  getCredentialsByRuc = async (c: Context) => {
    try {
      const ruc = c.req.param("ruc");

      if (!ruc) {
        return c.json({ error: "RUC es requerido" }, 400);
      }

      const credentials = await this.getCompanyCredentialsByRucUseCase.execute(ruc);

      if (!credentials) {
        return c.json({ error: "Credenciales no encontradas" }, 404);
      }

      return c.json({
        message: "Credenciales obtenidas exitosamente",
        data: credentials.toPublicData(),
      });
    } catch (error) {
      console.error("Error getting credentials by RUC:", error);
      return c.json(
        {
          error: "Error al obtener credenciales",
          details: error instanceof Error ? error.message : "Error desconocido",
        },
        500
      );
    }
  };

  /**
   * GET /api/v1/company/credentials/:ruc/decrypted
   * Obtener credenciales desencriptadas (con contraseña en texto plano)
   */
  getDecryptedCredentials = async (c: Context) => {
    try {
      const ruc = c.req.param("ruc");

      if (!ruc) {
        return c.json({ error: "RUC es requerido" }, 400);
      }

      const credentials = await this.getDecryptedCredentialsByRucUseCase.execute(ruc);

      if (!credentials) {
        return c.json({ error: "Credenciales no encontradas" }, 404);
      }

      return c.json({
        message: "Credenciales desencriptadas obtenidas exitosamente",
        data: credentials,
      });
    } catch (error) {
      console.error("Error getting decrypted credentials:", error);
      return c.json(
        {
          error: "Error al obtener credenciales desencriptadas",
          details: error instanceof Error ? error.message : "Error desconocido",
        },
        500
      );
    }
  };

  /**
   * PATCH /api/v1/company/credentials/:ruc/password
   * Actualizar solo la contraseña
   */
  updatePassword = async (c: Context) => {
    try {
      const ruc = c.req.param("ruc");
      const body = await c.req.json();
      const { password } = body;

      if (!ruc) {
        return c.json({ error: "RUC es requerido" }, 400);
      }

      if (!password) {
        return c.json({ error: "La nueva contraseña es requerida" }, 400);
      }

      const updated = await this.updateCompanyPasswordUseCase.execute(ruc, password);

      if (!updated) {
        return c.json({ error: "Credenciales no encontradas" }, 404);
      }

      return c.json({
        message: "Contraseña actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      return c.json(
        {
          error: "Error al actualizar contraseña",
          details: error instanceof Error ? error.message : "Error desconocido",
        },
        500
      );
    }
  };

  /**
   * DELETE /api/v1/company/credentials/:ruc
   * Eliminar credenciales
   */
  deleteCredentials = async (c: Context) => {
    try {
      const ruc = c.req.param("ruc");

      if (!ruc) {
        return c.json({ error: "RUC es requerido" }, 400);
      }

      const deleted = await this.deleteCompanyCredentialsUseCase.execute(ruc);

      if (!deleted) {
        return c.json({ error: "Credenciales no encontradas" }, 404);
      }

      return c.json({
        message: "Credenciales eliminadas exitosamente",
      });
    } catch (error) {
      console.error("Error deleting credentials:", error);
      return c.json(
        {
          error: "Error al eliminar credenciales",
          details: error instanceof Error ? error.message : "Error desconocido",
        },
        500
      );
    }
  };
}