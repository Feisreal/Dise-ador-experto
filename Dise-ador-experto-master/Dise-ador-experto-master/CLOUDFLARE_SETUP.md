# Guía de Instalación y Configuración de Cloudflare

Este documento proporciona instrucciones paso a paso para instalar y configurar Cloudflare junto con todas las integraciones MCP (Gmail, Google Calendar, Notion, Zapier) en el proyecto FEISS Knowledge.

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación de Cloudflare](#instalación-de-cloudflare)
3. [Configuración de Integraciones MCP](#configuración-de-integraciones-mcp)
4. [Despliegue](#despliegue)
5. [Verificación](#verificación)
6. [Solución de Problemas](#solución-de-problemas)

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener:

- **Node.js** 14.0.0 o superior
- **npm** 6.0.0 o superior
- **Cuenta de Cloudflare** (gratuita o de pago)
- **Cuenta de Vercel** con el proyecto desplegado
- **Acceso a MCP servers** (Gmail, Google Calendar, Notion, Zapier)

### Instalación de Dependencias

```bash
# Instalar dependencias del proyecto
npm install

# Instalar Wrangler CLI (herramienta de Cloudflare)
npm install -g wrangler

# Verificar instalación
wrangler --version
```

---

## Instalación de Cloudflare

### Paso 1: Configurar Wrangler

```bash
# Autenticarse con Cloudflare
wrangler login

# Esto abrirá tu navegador para autorizar el acceso a tu cuenta de Cloudflare
```

### Paso 2: Obtener Credenciales de Cloudflare

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Selecciona tu dominio (feispla.vercel.app)
3. Ve a **Configuración > API** y copia:
   - **Account ID**
   - **Zone ID**
   - **API Token** (crea uno nuevo si es necesario)

### Paso 3: Actualizar wrangler.toml

Abre `wrangler.toml` y reemplaza los valores de placeholder:

```toml
account_id = "YOUR_CLOUDFLARE_ACCOUNT_ID"  # Reemplazar
zone_id = "YOUR_CLOUDFLARE_ZONE_ID"        # Reemplazar
```

### Paso 4: Configurar Variables de Entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` y completa los valores de Cloudflare:

```env
CLOUDFLARE_ACCOUNT_ID=your-actual-account-id
CLOUDFLARE_API_TOKEN=your-actual-api-token
CLOUDFLARE_ZONE_ID=your-actual-zone-id
CLOUDFLARE_TURNSTILE_SITE_KEY=your-turnstile-site-key
CLOUDFLARE_TURNSTILE_SECRET_KEY=your-turnstile-secret-key
```

### Paso 5: Configurar Turnstile (CAPTCHA de Cloudflare)

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Ve a **Herramientas > Turnstile**
3. Crea un nuevo sitio:
   - **Nombre del sitio**: FEISS Knowledge
   - **Dominio**: feispla.vercel.app
   - **Modo**: Managed
4. Copia las claves y actualiza `.env`

---

## Configuración de Integraciones MCP

### Gmail Integration

#### Instalación

```bash
# Las integraciones MCP ya están implementadas en los servicios
# Verifica que el servicio de Gmail esté disponible
ls -la services/gmail_service.js
```

#### Configuración

1. Asegúrate de que tienes acceso al MCP server de Gmail
2. El servicio usa `manus-mcp-cli` automáticamente
3. No requiere configuración adicional en `.env`

#### Uso

El servicio de Gmail se usa automáticamente en:
- Confirmación de pagos (`POST /api/create-payment-intent`)
- Confirmación de reservas de demo (`POST /api/book-demo`)
- Confirmación de tickets de soporte (`POST /api/support-ticket`)

### Google Calendar Integration

#### Instalación

```bash
# Verifica que el servicio de Calendar esté disponible
ls -la services/calendar_service.js
```

#### Configuración

1. Asegúrate de que tienes acceso al MCP server de Google Calendar
2. El servicio usa `manus-mcp-cli` automáticamente
3. No requiere configuración adicional en `.env`

#### Uso

El servicio de Calendar se usa en:
- Reserva de demostraciones (`POST /api/book-demo`)
- Búsqueda de disponibilidad (`GET /api/calendar/available-slots`)

### Notion Integration

#### Instalación

```bash
# Verifica que el servicio de Notion esté disponible
ls -la services/notion_service.js
```

#### Configuración

1. Crea una base de datos en Notion para soporte
2. Obtén el ID de la base de datos
3. Actualiza `.env`:

```env
NOTION_SUPPORT_DB_ID=your-notion-support-database-id
NOTION_DOCS_DB_ID=your-notion-docs-database-id
```

#### Uso

El servicio de Notion se usa en:
- Obtención de documentación dinámica (`GET /api/documentation`)
- Creación de tickets de soporte (`POST /api/support-ticket`)

### Zapier Integration

#### Instalación

```bash
# Verifica que el servicio de Zapier esté disponible
ls -la services/zapier_service.js
```

#### Configuración

1. Crea un webhook en Zapier
2. Obtén la URL del webhook
3. Actualiza `.env`:

```env
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_ZAPIER_ID/YOUR_ZAPIER_TOKEN
```

#### Uso

El servicio de Zapier se usa en:
- Automatización post-venta (`POST /api/create-payment-intent`)
- Sincronización de datos con CRM
- Notificaciones a Slack

---

## Despliegue

### Opción 1: Desplegar en Cloudflare Workers

```bash
# Desplegar el Worker
wrangler deploy

# Verificar despliegue
wrangler deployments list
```

### Opción 2: Desplegar en Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar a Vercel
vercel --prod

# Configurar dominio personalizado en Vercel
# Ve a Vercel Dashboard > Project Settings > Domains
```

### Opción 3: Configurar Cloudflare como Proxy de Vercel

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Ve a **DNS**
3. Crea un registro CNAME:
   - **Nombre**: feispla
   - **Contenido**: cname.vercel-dns.com
   - **Proxy**: Activado (naranja)

---

## Verificación

### Verificar Cloudflare Worker

```bash
# Ver logs del Worker
wrangler tail

# Hacer una solicitud de prueba
curl -X GET https://feispla.vercel.app/
```

### Verificar Integraciones MCP

```bash
# Probar endpoint de Gmail
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","message":"Test message"}'

# Probar endpoint de Calendar
curl -X POST http://localhost:3001/api/book-demo \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","date":"2024-12-25","time":"10:00"}'

# Probar endpoint de Notion
curl -X GET "http://localhost:3001/api/documentation?query=implementation"

# Probar endpoint de Zapier
curl -X POST http://localhost:3001/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{...payload...}'
```

### Verificar Headers de Seguridad

```bash
# Verificar headers de seguridad
curl -I https://feispla.vercel.app/

# Deberías ver:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000
```

---

## Solución de Problemas

### Problema: "Wrangler no encontrado"

```bash
# Solución: Instalar Wrangler globalmente
npm install -g wrangler
```

### Problema: "Error de autenticación de Cloudflare"

```bash
# Solución: Volver a autenticarse
wrangler logout
wrangler login
```

### Problema: "MCP server no disponible"

```bash
# Verificar disponibilidad de MCP servers
manus-mcp-cli tool list --server gmail
manus-mcp-cli tool list --server google-calendar
manus-mcp-cli tool list --server notion
manus-mcp-cli tool list --server zapier
```

### Problema: "Error de CORS"

Verifica que los headers CORS estén configurados correctamente en `src/index.js`:

```javascript
headers.set('Access-Control-Allow-Origin', '*');
headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
```

### Problema: "Caché no funciona"

Verifica la configuración de caché en `cloudflare.json`:

```json
"caching": {
  "browser_cache_ttl": 14400,
  "cache_level": "cache_everything"
}
```

---

## Próximos Pasos

1. **Monitoreo**: Configura alertas en Cloudflare Dashboard
2. **Analytics**: Habilita Web Analytics en Cloudflare
3. **Optimización**: Ajusta las reglas de caché según el tráfico
4. **Seguridad**: Revisa regularmente los logs de firewall
5. **Mantenimiento**: Actualiza las reglas de WAF según sea necesario

---

## Recursos Útiles

- [Documentación de Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Documentación de Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- [Documentación de Turnstile](https://developers.cloudflare.com/turnstile/)
- [Documentación de Gmail MCP](./MCP_INTEGRATION_GUIDE.md)
- [Documentación de Google Calendar MCP](./MCP_INTEGRATION_GUIDE.md)
- [Documentación de Notion MCP](./MCP_INTEGRATION_GUIDE.md)
- [Documentación de Zapier MCP](./MCP_INTEGRATION_GUIDE.md)

---

## Soporte

Si encuentras problemas durante la instalación o configuración:

1. Revisa los logs: `wrangler tail`
2. Consulta la documentación oficial
3. Abre un issue en el repositorio
4. Contacta al equipo de soporte de FEISS

