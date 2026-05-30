/**
 * Zapier MCP Service Integration
 * Gestiona la automatización de flujos de trabajo
 */

const { spawn } = require('child_process');

class ZapierService {
    constructor() {
        this.mcp_server = 'zapier';
    }

    /**
     * Busca acciones disponibles en Zapier
     * @param {String} query - Consulta de búsqueda
     */
    async searchActions(query) {
        try {
            const result = await this.callMCPTool('zapier_search_actions', {
                query: query
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error buscando acciones en Zapier:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Ejecuta una acción de Zapier
     * @param {String} actionId - ID de la acción
     * @param {Object} params - Parámetros de la acción
     */
    async executeAction(actionId, params) {
        try {
            const result = await this.callMCPTool('zapier_execute_action', {
                action_id: actionId,
                params: params
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error ejecutando acción en Zapier:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Automatiza el flujo post-venta
     * @param {Object} customerData - Datos del cliente {email, name, plan, amount}
     */
    async automatePostSaleFlow(customerData) {
        try {
            const { email, name, plan, amount } = customerData;

            // Crear un flujo de automatización que:
            // 1. Añade el cliente a una lista de correo
            // 2. Crea un contacto en CRM
            // 3. Envía notificación a Slack

            const result = await this.callMCPTool('zapier_execute_action', {
                action_id: 'post_sale_automation',
                params: {
                    email: email,
                    name: name,
                    plan: plan,
                    amount: amount,
                    timestamp: new Date().toISOString()
                }
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error automatizando flujo post-venta:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sincroniza datos entre aplicaciones
     * @param {String} sourceApp - Aplicación origen
     * @param {String} targetApp - Aplicación destino
     * @param {Object} data - Datos a sincronizar
     */
    async syncData(sourceApp, targetApp, data) {
        try {
            const result = await this.callMCPTool('zapier_execute_action', {
                action_id: 'data_sync',
                params: {
                    source_app: sourceApp,
                    target_app: targetApp,
                    data: data,
                    timestamp: new Date().toISOString()
                }
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error sincronizando datos:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Envía un webhook a Zapier
     * @param {String} webhookUrl - URL del webhook
     * @param {Object} payload - Datos a enviar
     */
    async sendWebhook(webhookUrl, payload) {
        try {
            const result = await this.callMCPTool('zapier_send_webhook', {
                webhook_url: webhookUrl,
                payload: payload,
                timestamp: new Date().toISOString()
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error enviando webhook a Zapier:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Llama a una herramienta MCP a través de manus-mcp-cli
     * @param {String} toolName - Nombre de la herramienta
     * @param {Object} input - Parámetros de entrada
     */
    async callMCPTool(toolName, input) {
        return new Promise((resolve, reject) => {
            const process = spawn('manus-mcp-cli', [
                'tool',
                'call',
                toolName,
                '--server',
                this.mcp_server,
                '--input',
                JSON.stringify(input)
            ]);

            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    try {
                        resolve(JSON.parse(stdout));
                    } catch (e) {
                        resolve(stdout);
                    }
                } else {
                    reject(new Error(stderr || `Proceso terminado con código ${code}`));
                }
            });
        });
    }
}

module.exports = new ZapierService();
