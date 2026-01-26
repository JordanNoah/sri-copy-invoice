import env from '@/shared/env';

export interface SuccessEmailData {
    service: string;
    message: string;
    details?: Record<string, any>;
    companyRuc?: string;
}

/**
 * Generate HTML template for success emails
 */
export function generateSuccessEmailHTML(data: SuccessEmailData): string {
    const { service, message, details, companyRuc } = data;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 30px -30px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .success-section {
            background-color: #f0fdf4;
            border-left: 4px solid #059669;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .success-section p {
            margin: 8px 0;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .details-table th,
        .details-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .details-table th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
        }
        .details-table td {
            word-break: break-word;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Operación Exitosa</h1>
        </div>
        
        <div class="success-section">
            <strong>${escapeHtml(service)}</strong>
            <p>${escapeHtml(message)}</p>
            ${companyRuc ? `<p><strong>RUC Empresa:</strong> ${escapeHtml(companyRuc)}</p>` : ''}
        </div>

        ${details && Object.keys(details).length > 0 ? `
        <h3>Detalles:</h3>
        <table class="details-table">
            <tbody>
                ${Object.entries(details)
                    .map(
                        ([key, value]) => `
                <tr>
                    <td><strong>${escapeHtml(key)}</strong></td>
                    <td>${escapeHtml(JSON.stringify(value))}</td>
                </tr>
                `
                    )
                    .join('')}
            </tbody>
        </table>
        ` : ''}

        <div class="footer">
            <p>Sistema SRI Invoice Copy - Ambiente: ${env.NODE_ENV}</p>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Generate plain text version of success email
 */
export function generateSuccessEmailText(data: SuccessEmailData): string {
    const { service, message, details, companyRuc } = data;

    let text = `
OPERACIÓN EXITOSA
=================

Servicio: ${service}
${companyRuc ? `RUC Empresa: ${companyRuc}\n` : ''}
Mensaje: ${message}
`;

    if (details && Object.keys(details).length > 0) {
        text += '\nDETALLES:\n';
        Object.entries(details).forEach(([key, value]) => {
            text += `${key}: ${JSON.stringify(value)}\n`;
        });
    }

    text += `\nAmbiente: ${env.NODE_ENV}\n`;

    return text;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
}
