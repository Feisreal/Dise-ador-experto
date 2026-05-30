# Guía de Integración de APIs MCP en FEISS

## Descripción General

Este documento explica cómo utilizar los servicios MCP (Model Context Protocol) integrados en el servidor mejorado de FEISS. Los servicios disponibles son:

1. **Gmail** - Gestión de correos electrónicos
2. **Google Calendar** - Programación de eventos y citas
3. **Notion** - Gestión de contenido y bases de datos
4. **Zapier** - Automatización de flujos de trabajo
5. **Hume AI** - Análisis de emociones
6. **Instagram** - Gestión de contenido social
7. **Lumin PDF** - Procesamiento de documentos
8. **Meta Ads Manager** - Gestión de publicidad
9. **MotherDuck** - Análisis de datos
10. **Neimo** - Inteligencia regulatoria
11. **Scite** - Investigación científica
12. **Vercel** - Gestión de despliegues
13. **Alpha Vantage** - Datos financieros
14. **Amplitude** - Análisis de producto y marketing
15. **Apify** - Extracción de datos web y automatización
16. **Cal.com** - Programación de citas
17. **Consensus** - Búsqueda de artículos científicos
18. **Outlook Calendar** - Gestión de calendario
19. **Outlook Mail** - Gestión de correo electrónico
20. **GitHub** - Control de versiones y gestión de repositorios

## Estructura de Servicios

Todos los servicios se encuentran en el directorio `/services/`:

```
services/
├── alpha_vantage_service.js
├── amplitude_service.js
├── apify_service.js
├── cal_com_service.js
├── calendar_service.js
├── consensus_service.js
├── gmail_service.js
├── github_service.js
├── hume_service.js
├── instagram_service.js
├── lumin_pdf_service.js
├── meta_ads_manager_service.js
├── motherduck_service.js
├── neimo_service.js
├── notion_service.js
├── outlook_calendar_service.js
├── outlook_mail_service.js
├── scite_service.js
├── slack_service.js
├── vercel_service.js
└── zapier_service.js
```

## Configuración Requerida

### Variables de Entorno (.env)

```env
# Gmail
GMAIL_API_KEY=tu_api_key_aqui

# Google Calendar
GOOGLE_CALENDAR_API_KEY=tu_api_key_aqui

# Notion
NOTION_API_KEY=tu_api_key_aqui
NOTION_SUPPORT_DB_ID=id_de_tu_base_de_datos

# Zapier
ZAPIER_API_KEY=tu_api_key_aqui
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/...

# Hume
HUME_API_KEY=tu_api_key_aqui
HUME_BASE_URL=https://api.hume.com/v1

# Instagram
INSTAGRAM_API_KEY=tu_api_key_aqui
INSTAGRAM_BASE_URL=https://api.instagram.com/v1

# Lumin PDF
LUMIN_PDF_API_KEY=tu_api_key_aqui
LUMIN_PDF_BASE_URL=https://api.luminpdf.com/v1

# Meta Ads Manager
META_ADS_MANAGER_API_KEY=tu_api_key_aqui
META_ADS_MANAGER_BASE_URL=https://api.metaadsmanager.com/v1

# MotherDuck
MOTHERDUCK_API_KEY=tu_api_key_aqui
MOTHERDUCK_BASE_URL=https://api.motherduck.com/v1

# Neimo
NEIMO_API_KEY=tu_api_key_aqui
NEIMO_BASE_URL=https://api.neimo.com/v1

# Scite
SCITE_API_KEY=tu_api_key_aqui
SCITE_BASE_URL=https://api.scite.com/v1

# Vercel
VERCEL_API_KEY=tu_api_key_aqui
VERCEL_BASE_URL=https://api.vercel.com/v1

# Alpha Vantage
ALPHA_VANTAGE_API_KEY=tu_api_key_aqui
ALPHA_VANTAGE_BASE_URL=https://api.alphavantage.co/v1

# Amplitude
AMPLITUDE_API_KEY=tu_api_key_aqui
AMPLITUDE_BASE_URL=https://api.amplitude.com/v1

# Apify
APIFY_API_KEY=tu_api_key_aqui
APIFY_BASE_URL=https://api.apify.com/v1

# Cal.com
CAL_COM_API_KEY=tu_api_key_aqui
CAL_COM_BASE_URL=https://api.cal.com/v1

# Consensus
CONSENSUS_API_KEY=tu_api_key_aqui
CONSENSUS_BASE_URL=https://api.consensus.app/v1

# Outlook Calendar
OUTLOOK_CALENDAR_API_KEY=tu_api_key_aqui
OUTLOOK_CALENDAR_BASE_URL=https://graph.microsoft.com/v1.0

# Outlook Mail
OUTLOOK_MAIL_API_KEY=tu_api_key_aqui
OUTLOOK_MAIL_BASE_URL=https://graph.microsoft.com/v1.0

# GitHub
GITHUB_API_KEY=tu_api_key_aqui
GITHUB_BASE_URL=https://api.github.com/v3
```

## Uso de los Servicios

### 1. Gmail Service

#### Enviar Email de Confirmación

```javascript
const gmailService = require("./services/gmail_service");

const result = await gmailService.sendConfirmationEmail({
    to: "cliente@example.com",
    subject: "¡Bienvenido a FEISS!",
    name: "Juan Pérez",
    plan: "Professional",
    price: 99.99,
    purchaseDate: new Date()
});
```

#### Buscar Correos

```javascript
const result = await gmailService.searchEmails("from:cliente@example.com");
```

#### Gestionar Etiquetas

```javascript
// Crear una etiqueta
const result = await gmailService.manageLabels("create", {
    name: "FEISS Clientes"
});

// Aplicar etiqueta a mensajes
const result = await gmailService.manageLabels("apply", {
    label_id: "Label_123",
    message_ids: ["msg_1", "msg_2"]
});
```

### 2. Google Calendar Service

#### Crear Evento de Demo

```javascript
const calendarService = require("./services/calendar_service");

const result = await calendarService.createDemoEvent({
    email: "cliente@example.com",
    name: "Ana López",
    date: "2026-06-30",
    time: "10:00",
    duration: 60
});
```

#### Buscar Espacios Disponibles

```javascript
const timeMin = new Date().toISOString();
const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

const result = await calendarService.searchAvailableSlots(timeMin, timeMax);
```

#### Actualizar Evento

```javascript
const result = await calendarService.updateEvent("event_id_123", {
    summary: "Demo FEISS - Actualizada",
    description: "Nueva descripción del evento"
});
```

### 3. Notion Service

#### Buscar Documentación

```javascript
const notionService = require("./services/notion_service");

const result = await notionService.searchContent(
    "cómo instalar FEISS",
    "internal"
);
```

#### Obtener Página Completa

```javascript
const result = await notionService.fetchPage("page_id_o_url");
```

#### Crear Página

```javascript
const result = await notionService.createPage({
    parent_id: "parent_database_id",
    title: "Nueva Documentación",
    content: "# Título\n\nContenido de la página..."
});
```

#### Consultar Base de Datos

```javascript
const result = await notionService.queryDatabase(
    "database_id",
    "view_id"
);
```

#### Añadir Comentario

```javascript
const result = await notionService.addComment(
    "page_id",
    "Este es un comentario importante"
);
```

### 4. Zapier Service

#### Automatizar Flujo Post-Venta

```javascript
const zapierService = require("./services/zapier_service");

const result = await zapierService.automatePostSaleFlow({
    email: "cliente@example.com",
    name: "Juan Pérez",
    plan: "Professional",
    amount: 99.99
});
```

#### Sincronizar Datos

```javascript
const result = await zapierService.syncData(
    "stripe",
    "hubspot",
    {
        email: "cliente@example.com",
        name: "Juan Pérez",
        plan: "Professional"
    }
);
```

#### Enviar Webhook

```javascript
const result = await zapierService.sendWebhook(
    "https://hooks.zapier.com/hooks/catch/...",
    {
        event: "purchase_completed",
        customer: "Juan Pérez",
        amount: 99.99
    }
);
```

### 5. Hume AI Service

#### Analizar Emociones

```javascript
const humeService = require("./services/hume_service");

const result = await humeService.sendData({ text: "Estoy muy contento con los resultados de FEISS!" });
```

### 6. Instagram Service

#### Obtener Publicaciones de Usuario

```javascript
const instagramService = require("./services/instagram_service");

const result = await instagramService.fetchData("userId_de_instagram");
```

### 7. Lumin PDF Service

#### Procesar Documento PDF

```javascript
const luminPdfService = require("./services/lumin_pdf_service");

const result = await luminPdfService.sendData({ url: "https://example.com/documento.pdf" });
```

### 8. Meta Ads Manager Service

#### Obtener Insights de Campañas

```javascript
const metaAdsManagerService = require("./services/meta_ads_manager_service");

const result = await metaAdsManagerService.fetchData("campaignId_de_meta_ads");
```

### 9. MotherDuck Service

#### Ejecutar Consulta DuckDB

```javascript
const motherduckService = require("./services/motherduck_service");

const result = await motherduckService.sendData({ query: "SELECT * FROM my_table;" });
```

### 10. Neimo Service

#### Obtener Información Regulatoria

```javascript
const neimoService = require("./services/neimo_service");

const result = await neimoService.fetchData("jurisdiction/topic");
```

### 11. Scite Service

#### Buscar Citas Científicas

```javascript
const sciteService = require("./services/scite_service");

const result = await sciteService.fetchData("consulta de investigación");
```

### 12. Vercel Service

#### Obtener Despliegues

```javascript
const vercelService = require("./services/vercel_service");

const result = await vercelService.fetchData("projectId_de_vercel");
```

### 13. Alpha Vantage Service

#### Obtener Datos de Acciones

```javascript
const alphaVantageService = require("./services/alpha_vantage_service");

const result = await alphaVantageService.fetchData("IBM");
```

### 14. Amplitude Service

#### Registrar Evento

```javascript
const amplitudeService = require("./services/amplitude_service");

const result = await amplitudeService.sendData({
    eventType: "compra_plan",
    userId: "user_123",
    eventProperties: { plan: "Professional", amount: 99.99 }
});
```

### 15. Apify Service

#### Ejecutar Actor

```javascript
const apifyService = require("./services/apify_service");

const result = await apifyService.sendData({
    actorId: "actor_id_ejemplo",
    input: { startUrl: "https://example.com" }
});
```

### 16. Cal.com Service

#### Crear Reserva

```javascript
const calComService = require("./services/cal_com_service");

const result = await calComService.sendData({
    eventType: "demo_feiss",
    email: "cliente@example.com",
    name: "Juan Pérez",
    date: "2026-07-01",
    time: "11:00"
});
```

### 17. Consensus Service

#### Buscar Artículos Científicos

```javascript
const consensusService = require("./services/consensus_service");

const result = await consensusService.fetchData("inteligencia artificial en e-commerce");
```

### 18. Outlook Calendar Service

#### Crear Evento

```javascript
const outlookCalendarService = require("./services/outlook_calendar_service");

const result = await outlookCalendarService.sendData({
    subject: "Reunión de Proyecto FEISS",
    start: "2026-07-02T09:00:00",
    end: "2026-07-02T10:00:00",
    attendees: ["equipo@example.com"]
});
```

### 19. Outlook Mail Service

#### Enviar Correo

```javascript
const outlookMailService = require("./services/outlook_mail_service");

const result = await outlookMailService.sendData({
    to: "destinatario@example.com",
    subject: "Actualización de FEISS",
    body: "Hola, te enviamos una actualización importante..."
});
```

### 20. GitHub Service

#### Obtener Información de Repositorio

```javascript
const githubService = require("./services/github_service");

const result = await githubService.fetchData("feispla/feiss-knowledge");
```

## Rutas API Mejoradas

El `server_enhanced.js` ahora incluye rutas para todas estas nuevas integraciones. Puedes consultar el archivo `server_enhanced.js` para ver los endpoints específicos y cómo se conectan con los servicios.

## Generar Nuevos Servicios

Utiliza el script `generate_api_integration.py` para crear nuevos servicios:

```bash
python3 generate_api_integration.py "NombreDeLaAPI"
```

## Migración y Despliegue

Para usar el servidor mejorado y la nueva estructura de la web:

```bash
# Reemplazar el servidor actual con la versión mejorada
cp server_enhanced.js server.js

# Reemplazar el index.html actual con la versión categorizada
cp index_categorized.html index.html

# Instalar dependencias si es necesario
npm install

# Iniciar el servidor
npm start
```

## Manejo de Errores y Mejores Prácticas

Se mantienen las mismas recomendaciones de manejo de errores, validación, logging, rate limiting y seguridad mencionadas en la guía anterior.

## Troubleshooting

Las secciones de troubleshooting para `manus-mcp-cli not found`, `API Key not configured` y `Connection timeout` siguen siendo válidas.

## Recursos Adicionales

- [Documentación de Gmail MCP](https://manus.im/docs/mcp/gmail)
- [Documentación de Google Calendar MCP](https://manus.im/docs/mcp/calendar)
- [Documentación de Notion MCP](https://manus.im/docs/mcp/notion)
- [Documentación de Zapier MCP](https://manus.im/docs/mcp/zapier)
- [Documentación de Hume MCP](https://manus.im/docs/mcp/hume)
- [Documentación de Instagram MCP](https://manus.im/docs/mcp/instagram)
- [Documentación de Lumin PDF MCP](https://manus.im/docs/mcp/lumin-pdf)
- [Documentación de Meta Marketing MCP](https://manus.im/docs/mcp/meta-marketing)
- [Documentación de MotherDuck MCP](https://manus.im/docs/mcp/motherduck)
- [Documentación de Neimo MCP](https://manus.im/docs/mcp/neimo)
- [Documentación de Scite MCP](https://manus.im/docs/mcp/scite)
- [Documentación de Vercel MCP](https://manus.im/docs/mcp/vercel)
- [Documentación de Alpha Vantage MCP](https://manus.im/docs/mcp/alpha-vantage)
- [Documentación de Amplitude MCP](https://manus.im/docs/mcp/amplitude)
- [Documentación de Apify MCP](https://manus.im/docs/mcp/apify)
- [Documentación de Cal.com MCP](https://manus.im/docs/mcp/cal-com)
- [Documentación de Consensus MCP](https://manus.im/docs/mcp/consensus)
- [Documentación de Outlook Calendar MCP](https://manus.im/docs/mcp/outlook-calendar)
- [Documentación de Outlook Mail MCP](https://manus.im/docs/mcp/outlook-mail)
- [Documentación de GitHub MCP](https://manus.im/docs/mcp/github)
