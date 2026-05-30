/**
 * Notion MCP Service Integration
 * Gestiona la documentación dinámica y bases de datos
 */

const { spawn } = require('child_process');

class NotionService {
    constructor() {
        this.mcp_server = 'notion';
    }

    /**
     * Busca contenido en Notion
     * @param {String} query - Consulta de búsqueda
     * @param {String} queryType - 'internal' o 'user'
     */
    async searchContent(query, queryType = 'internal') {
        try {
            const result = await this.callMCPTool('notion-search', {
                query: query,
                query_type: queryType,
                page_size: 10,
                max_highlight_length: 200
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error buscando en Notion:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene el contenido completo de una página o base de datos
     * @param {String} id - ID o URL de la página/base de datos
     */
    async fetchPage(id) {
        try {
            const result = await this.callMCPTool('notion-fetch', {
                id: id
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error obteniendo página de Notion:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Crea una nueva página en Notion
     * @param {Object} data - {parent_id, title, content}
     */
    async createPage(data) {
        try {
            const { parent_id, title, content } = data;

            const result = await this.callMCPTool('notion-create-pages', {
                parent_id: parent_id,
                title: title,
                content: content
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error creando página en Notion:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualiza una página existente en Notion
     * @param {String} pageId - ID de la página
     * @param {Object} updates - Campos a actualizar
     */
    async updatePage(pageId, updates) {
        try {
            const result = await this.callMCPTool('notion-update-page', {
                page_id: pageId,
                ...updates
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error actualizando página en Notion:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Crea una base de datos en Notion
     * @param {Object} data - {parent_id, title, schema}
     */
    async createDatabase(data) {
        try {
            const { parent_id, title, schema } = data;

            const result = await this.callMCPTool('notion-create-database', {
                parent_id: parent_id,
                title: title,
                schema: schema
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error creando base de datos en Notion:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Consulta una vista de base de datos
     * @param {String} databaseId - ID de la base de datos
     * @param {String} viewId - ID de la vista
     */
    async queryDatabase(databaseId, viewId) {
        try {
            const result = await this.callMCPTool('notion-query-database-view', {
                database_id: databaseId,
                view_id: viewId
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error consultando base de datos:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Añade un comentario a una página
     * @param {String} pageId - ID de la página
     * @param {String} comment - Texto del comentario
     */
    async addComment(pageId, comment) {
        try {
            const result = await this.callMCPTool('notion-create-comment', {
                page_id: pageId,
                content: comment
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error añadiendo comentario:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene comentarios de una página
     * @param {String} pageId - ID de la página
     */
    async getComments(pageId) {
        try {
            const result = await this.callMCPTool('notion-get-comments', {
                page_id: pageId
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error obteniendo comentarios:', error);
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

module.exports = new NotionService();
