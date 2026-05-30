import os
import sys

def create_api_integration(api_name):
    """
    Genera la estructura básica para integrar una nueva API en el servidor FEISS.
    """
    api_name_lower = api_name.lower().replace(" ", "_").replace(".", "_")
    api_name_camel = api_name.title().replace(" ", "").replace(".", "")
    
    # 1. Crear directorio de servicios si no existe
    services_dir = "services"
    if not os.path.exists(services_dir):
        os.makedirs(services_dir)
        print(f"Directorio '{services_dir}' creado.")

    # 2. Generar el archivo de servicio de la API
    service_content = f"""/**
 * {api_name} Service Integration
 * Generado automáticamente para FEISS Knowledge Repository
 */

const axios = require('axios');

class {api_name_camel}Service {{
    constructor() {{
        this.apiKey = process.env.{api_name_lower.upper()}_API_KEY;
        this.baseUrl = process.env.{api_name_lower.upper()}_BASE_URL || 'https://api.{api_name_lower}.com/v1';
        
        if (!this.apiKey) {{
            console.warn('Advertencia: {api_name_lower.upper()}_API_KEY no está configurada en el entorno.');
        }}
    }}

    /**
     * Ejemplo de método para enviar datos a la API
     * @param {{Object}} data - Datos a enviar
     */
    async sendData(data) {{
        try {{
            const response = await axios.post(`${{this.baseUrl}}/endpoint`, data, {{
                headers: {{
                    'Authorization': `Bearer ${{this.apiKey}}`,
                    'Content-Type': 'application/json'
                }}
            }});
            return {{ success: true, data: response.data }};
        }} catch (error) {{
            console.error(`Error en {api_name_camel}Service:`, error.message);
            return {{ success: false, error: error.message }};
        }}
    }}

    /**
     * Ejemplo de método para obtener datos de la API
     */
    async fetchData(id) {{
        try {{
            const response = await axios.get(`${{this.baseUrl}}/resource/${{id}}`, {{
                headers: {{ 'Authorization': `Bearer ${{this.apiKey}}` }}
            }});
            return {{ success: true, data: response.data }};
        }} catch (error) {{
            console.error(`Error al obtener datos de {api_name_camel}Service:`, error.message);
            return {{ success: false, error: error.message }};
        }}
    }}
}}

module.exports = new {api_name_camel}Service();
"""

    service_file_path = os.path.join(services_dir, f"{api_name_lower}_service.js")
    with open(service_file_path, "w") as f:
        f.write(service_content)
    
    print(f"Archivo de servicio creado en: {service_file_path}")

    # 3. Sugerir cambios en .env
    print("\n--- CONFIGURACIÓN REQUERIDA ---")
    print(f"Añade lo siguiente a tu archivo .env:")
    print(f"{api_name_lower.upper()}_API_KEY=tu_api_key_aqui")
    print(f"{api_name_lower.upper()}_BASE_URL=https://api.{api_name_lower}.com/v1")

    # 4. Sugerir integración en server.js
    print("\n--- CÓDIGO PARA server.js ---")
    print(f"const {api_name_lower}Service = require('./services/{api_name_lower}_service');")
    print(f"\n// Ejemplo de uso en una ruta:")
    print(f"app.post('/api/{api_name_lower}/action', async (req, res) => {{")
    print(f"    const result = await {api_name_lower}Service.sendData(req.body);")
    print(f"    res.json(result);")
    print(f"}});")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 generate_api_integration.py <NombreDeLaAPI>")
    else:
        api_name = sys.argv[1]
        create_api_integration(api_name)
