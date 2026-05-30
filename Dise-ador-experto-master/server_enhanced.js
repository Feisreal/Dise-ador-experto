/**
 * FEISS Enhanced Payment Server with MCP Integrations
 * Backend mejorado con integraciones de Gmail, Google Calendar, Notion y Zapier
 */

require("dotenv").config();

const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_YOUR_STRIPE_SECRET_KEY_HERE");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

// Importar servicios MCP
const gmailService = require("./services/gmail_service");
const calendarService = require("./services/calendar_service");
const notionService = require("./services/notion_service");
const zapierService = require("./services/zapier_service");
const humeService = require("./services/hume_service");
const instagramService = require("./services/instagram_service");
const luminPdfService = require("./services/lumin_pdf_service");
const metaAdsManagerService = require("./services/meta_ads_manager_service");
const motherduckService = require("./services/motherduck_service");
const neimoService = require("./services/neimo_service");
const sciteService = require("./services/scite_service");
const vercelService = require("./services/vercel_service");
const alphaVantageService = require("./services/alpha_vantage_service");
const amplitudeService = require("./services/amplitude_service");
const apifyService = require("./services/apify_service");
const calComService = require("./services/cal_com_service");
const consensusService = require("./services/consensus_service");
const outlookCalendarService = require("./services/outlook_calendar_service");
const outlookMailService = require("./services/outlook_mail_service");
const githubService = require("./services/github_service");
const lineService = require("./services/line_service");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());

// Webhook de Stripe debe ir antes de bodyParser.json() para acceder al raw body
app.post("/api/webhook/stripe", express.raw({type: "application/json"}), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

        switch (event.type) {
            case "payment_intent.succeeded":
                console.log("Payment succeeded:", event.data.object);
                // Integración con MCP: Enviar email de confirmación y automatizar flujos
                await handleSuccessfulPayment(event.data.object);
                break;
            case "payment_intent.payment_failed":
                console.log("Payment failed:", event.data.object);
                break;
            case "charge.refunded":
                console.log("Charge refunded:", event.data.object);
                await revokeAccess(event.data.object.metadata.email);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({received: true});
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Email Configuration (Fallback para Nodemailer)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Database simulation (en producción usar MongoDB, PostgreSQL, etc.)
const orders = [];

/**
 * POST /api/create-payment-intent
 * Crea un payment intent y procesa el pago
 */
app.post("/api/create-payment-intent", async (req, res) => {
    try {
        const {
            paymentMethodId,
            amount,
            email,
            fullName,
            company,
            planId,
            planName
        } = req.body;

        // Validación
        if (!paymentMethodId || !amount || !email || !fullName) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos requeridos"
            });
        }

        // Crear payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            payment_method: paymentMethodId,
            confirm: true,
            description: `FEISS ${planName} Plan - ${fullName}`,
            metadata: {
                email: email,
                fullName: fullName,
                company: company,
                planId: planId,
                planName: planName
            },
            receipt_email: email
        });

        if (paymentIntent.status === "succeeded") {
            // Guardar orden
            const order = {
                id: paymentIntent.id,
                email: email,
                fullName: fullName,
                company: company,
                planId: planId,
                planName: planName,
                amount: amount / 100,
                currency: "USD",
                status: "completed",
                createdAt: new Date(),
                accessToken: generateAccessToken(email, planId)
            };

            orders.push(order);

            // Integración MCP: Enviar email de confirmación con Gmail
            await sendConfirmationEmailMCP(email, fullName, planName, amount / 100);

            // Integración MCP: Automatizar flujo post-venta con Zapier
            await automatePostSaleFlowMCP({
                email: email,
                name: fullName,
                plan: planName,
                amount: amount / 100,
                company: company
            });

            // Crear usuario en base de datos
            await createCustomer(email, fullName, company, planId);

            return res.json({
                success: true,
                message: "Pago procesado exitosamente",
                paymentIntentId: paymentIntent.id,
                accessToken: order.accessToken
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "El pago no pudo ser procesado"
            });
        }
    } catch (error) {
        console.error("Payment error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error al procesar el pago"
        });
    }
});

/**
 * POST /api/book-demo
 * Reserva una demostración usando Google Calendar
 */
app.post("/api/book-demo", async (req, res) => {
    try {
        const { email, name, date, time } = req.body;

        if (!email || !name || !date || !time) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos requeridos para la reserva"
            });
        }

        // Crear evento en Google Calendar
        const calendarResult = await calendarService.createDemoEvent({
            email: email,
            name: name,
            date: date,
            time: time,
            duration: 60
        });

        if (calendarResult.success) {
            // Enviar confirmación por email
            await gmailService.sendConfirmationEmail({
                to: email,
                subject: `Reserva de Demo Confirmada - FEISS`,
                name: name,
                plan: "Demo",
                price: "Gratis",
                purchaseDate: new Date()
            });

            return res.json({
                success: true,
                message: "Demo reservada exitosamente",
                data: calendarResult.data
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Error al reservar la demo"
            });
        }
    } catch (error) {
        console.error("Demo booking error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error al reservar la demo"
        });
    }
});

/**
 * GET /api/documentation
 * Obtiene documentación dinámica desde Notion
 */
app.get("/api/documentation", async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Se requiere una consulta"
            });
        }

        // Buscar documentación en Notion
        const notionResult = await notionService.searchContent(query, "internal");

        if (notionResult.success) {
            return res.json({
                success: true,
                data: notionResult.data
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Error al obtener documentación"
            });
        }
    } catch (error) {
        console.error("Documentation error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error al obtener documentación"
        });
    }
});

/**
 * POST /api/support-ticket
 * Crea un ticket de soporte y lo registra en Notion
 */
app.post("/api/support-ticket", async (req, res) => {
    try {
        const { email, name, subject, message } = req.body;

        if (!email || !name || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos requeridos"
            });
        }

        // Crear página en Notion para el ticket
        const notionResult = await notionService.createPage({
            parent_id: process.env.NOTION_SUPPORT_DB_ID,
            title: `[${new Date().toISOString().split("T")[0]}] ${subject}`,
            content: `**Cliente:** ${name}\n**Email:** ${email}\n\n**Mensaje:**\n${message}`
        });

        if (notionResult.success) {
            // Enviar confirmación por email
            await gmailService.sendConfirmationEmail({
                to: email,
                subject: `Ticket de Soporte Recibido - ${subject}`,
                name: name,
                plan: "Support",
                price: "N/A",
                purchaseDate: new Date()
            });

            return res.json({
                success: true,
                message: "Ticket de soporte creado exitosamente",
                ticketId: notionResult.data.id
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Error al crear el ticket de soporte"
            });
        }
    } catch (error) {
        console.error("Support ticket error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error al crear el ticket de soporte"
        });
    }
});

// Nuevas rutas para las APIs adicionales

/**
 * POST /api/hume/analyze-emotion
 * Analiza emociones usando Hume AI
 */
app.post("/api/hume/analyze-emotion", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ success: false, message: "Se requiere texto para analizar" });
        }
        const result = await humeService.sendData({ text: text }); // Asumiendo que sendData es para análisis
        res.json(result);
    } catch (error) {
        console.error("Hume API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al analizar emociones con Hume" });
    }
});

/**
 * GET /api/instagram/user-posts
 * Obtiene publicaciones de un usuario de Instagram
 */
app.get("/api/instagram/user-posts", async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ success: false, message: "Se requiere un ID de usuario de Instagram" });
        }
        const result = await instagramService.fetchData(userId); // Asumiendo fetchData obtiene posts
        res.json(result);
    } catch (error) {
        console.error("Instagram API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al obtener publicaciones de Instagram" });
    }
});

/**
 * POST /api/lumin-pdf/process-document
 * Procesa un documento PDF con Lumin PDF
 */
app.post("/api/lumin-pdf/process-document", async (req, res) => {
    try {
        const { documentUrl } = req.body;
        if (!documentUrl) {
            return res.status(400).json({ success: false, message: "Se requiere la URL del documento PDF" });
        }
        const result = await luminPdfService.sendData({ url: documentUrl }); // Asumiendo sendData procesa el documento
        res.json(result);
    } catch (error) {
        console.error("Lumin PDF API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al procesar documento con Lumin PDF" });
    }
});

/**
 * GET /api/meta-ads/campaign-insights
 * Obtiene insights de campañas de Meta Ads
 */
app.get("/api/meta-ads/campaign-insights", async (req, res) => {
    try {
        const { campaignId } = req.query;
        if (!campaignId) {
            return res.status(400).json({ success: false, message: "Se requiere un ID de campaña" });
        }
        const result = await metaAdsManagerService.fetchData(campaignId); // Asumiendo fetchData obtiene insights
        res.json(result);
    } catch (error) {
        console.error("Meta Ads Manager API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al obtener insights de Meta Ads" });
    }
});

/**
 * POST /api/motherduck/query-data
 * Ejecuta una consulta en MotherDuck
 */
app.post("/api/motherduck/query-data", async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ success: false, message: "Se requiere una consulta DuckDB" });
        }
        const result = await motherduckService.sendData({ query: query }); // Asumiendo sendData ejecuta la consulta
        res.json(result);
    } catch (error) {
        console.error("MotherDuck API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al ejecutar consulta en MotherDuck" });
    }
});

/**
 * GET /api/neimo/regulatory-info
 * Obtiene información regulatoria de Neimo
 */
app.get("/api/neimo/regulatory-info", async (req, res) => {
    try {
        const { jurisdiction, topic } = req.query;
        if (!jurisdiction || !topic) {
            return res.status(400).json({ success: false, message: "Se requiere jurisdicción y tema" });
        }
        const result = await neimoService.fetchData(`${jurisdiction}/${topic}`); // Asumiendo fetchData obtiene info
        res.json(result);
    } catch (error) {
        console.error("Neimo API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al obtener información regulatoria de Neimo" });
    }
});

/**
 * GET /api/scite/citations
 * Busca citas científicas con Scite
 */
app.get("/api/scite/citations", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ success: false, message: "Se requiere una consulta de investigación" });
        }
        const result = await sciteService.fetchData(query); // Asumiendo fetchData busca citas
        res.json(result);
    } catch (error) {
        console.error("Scite API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al buscar citas con Scite" });
    }
});

/**
 * GET /api/vercel/deployments
 * Obtiene despliegues de Vercel
 */
app.get("/api/vercel/deployments", async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) {
            return res.status(400).json({ success: false, message: "Se requiere un ID de proyecto de Vercel" });
        }
        const result = await vercelService.fetchData(projectId); // Asumiendo fetchData obtiene despliegues
        res.json(result);
    } catch (error) {
        console.error("Vercel API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al obtener despliegues de Vercel" });
    }
});

// Nuevas rutas para las APIs adicionales del segundo set

/**
 * GET /api/alpha-vantage/stock-data
 * Obtiene datos de acciones con Alpha Vantage
 */
app.get("/api/alpha-vantage/stock-data", async (req, res) => {
    try {
        const { symbol } = req.query;
        if (!symbol) {
            return res.status(400).json({ success: false, message: "Se requiere un símbolo de acción" });
        }
        const result = await alphaVantageService.fetchData(symbol); // Asumiendo fetchData obtiene datos de acciones
        res.json(result);
    } catch (error) {
        console.error("Alpha Vantage API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al obtener datos de acciones con Alpha Vantage" });
    }
});

/**
 * POST /api/amplitude/track-event
 * Registra un evento en Amplitude
 */
app.post("/api/amplitude/track-event", async (req, res) => {
    try {
        const { eventType, userId, eventProperties } = req.body;
        if (!eventType || !userId) {
            return res.status(400).json({ success: false, message: "Se requiere tipo de evento y ID de usuario" });
        }
        const result = await amplitudeService.sendData({ eventType, userId, eventProperties }); // Asumiendo sendData registra eventos
        res.json(result);
    } catch (error) {
        console.error("Amplitude API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al registrar evento en Amplitude" });
    }
});

/**
 * POST /api/apify/run-actor
 * Ejecuta un Actor de Apify
 */
app.post("/api/apify/run-actor", async (req, res) => {
    try {
        const { actorId, input } = req.body;
        if (!actorId) {
            return res.status(400).json({ success: false, message: "Se requiere un ID de Actor de Apify" });
        }
        const result = await apifyService.sendData({ actorId, input }); // Asumiendo sendData ejecuta Actor
        res.json(result);
    } catch (error) {
        console.error("Apify API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al ejecutar Actor de Apify" });
    }
});

/**
 * POST /api/cal-com/create-booking
 * Crea una reserva en Cal.com
 */
app.post("/api/cal-com/create-booking", async (req, res) => {
    try {
        const { eventType, email, name, date, time } = req.body;
        if (!eventType || !email || !name || !date || !time) {
            return res.status(400).json({ success: false, message: "Faltan datos requeridos para la reserva" });
        }
        const result = await calComService.sendData({ eventType, email, name, date, time }); // Asumiendo sendData crea reserva
        res.json(result);
    } catch (error) {
        console.error("Cal.com API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al crear reserva en Cal.com" });
    }
});

/**
 * GET /api/consensus/search-papers
 * Busca artículos científicos con Consensus
 */
app.get("/api/consensus/search-papers", async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ success: false, message: "Se requiere una consulta de investigación" });
        }
        const result = await consensusService.fetchData(query); // Asumiendo fetchData busca artículos
        res.json(result);
    } catch (error) {
        console.error("Consensus API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al buscar artículos con Consensus" });
    }
});

/**
 * POST /api/outlook-calendar/create-event
 * Crea un evento en Outlook Calendar
 */
app.post("/api/outlook-calendar/create-event", async (req, res) => {
    try {
        const { subject, start, end, attendees } = req.body;
        if (!subject || !start || !end) {
            return res.status(400).json({ success: false, message: "Se requiere asunto, inicio y fin del evento" });
        }
        const result = await outlookCalendarService.sendData({ subject, start, end, attendees }); // Asumiendo sendData crea evento
        res.json(result);
    } catch (error) {
        console.error("Outlook Calendar API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al crear evento en Outlook Calendar" });
    }
});

/**
 * POST /api/outlook-mail/send-email
 * Envía un correo con Outlook Mail
 */
app.post("/api/outlook-mail/send-email", async (req, res) => {
    try {
        const { to, subject, body } = req.body;
        if (!to || !subject || !body) {
            return res.status(400).json({ success: false, message: "Se requiere destinatario, asunto y cuerpo del correo" });
        }
        const result = await outlookMailService.sendData({ to, subject, body }); // Asumiendo sendData envía correo
        res.json(result);
    } catch (error) {
        console.error("Outlook Mail API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al enviar correo con Outlook Mail" });
    }
});

/**
 * GET /api/github/repo-info
 * Obtiene información de un repositorio de GitHub
 */
app.get("/api/github/repo-info", async (req, res) => {
    try {
        const { owner, repo } = req.query;
        if (!owner || !repo) {
            return res.status(400).json({ success: false, message: "Se requiere propietario y nombre del repositorio" });
        }
        const result = await githubService.fetchData(`${owner}/${repo}`); // Asumiendo fetchData obtiene info del repo
        res.json(result);
    } catch (error) {
        console.error("GitHub API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al obtener información del repositorio de GitHub" });
    }
});

/**
 * Funciones auxiliares
 */

function generateAccessToken(email, planId) {
    return Buffer.from(`${email}:${planId}:${Date.now()}`).toString("base64");
}

function calculateExpiration(createdAt, planId) {
    const expirationDays = {
        "basic": 180,
        "professional": 365,
        "enterprise": 730
    };

    const days = expirationDays[planId] || 365;
    const expirationDate = new Date(createdAt);
    expirationDate.setDate(expirationDate.getDate() + days);

    return expirationDate;
}

async function sendConfirmationEmailMCP(email, fullName, planName, price) {
    try {
        const result = await gmailService.sendConfirmationEmail({
            to: email,
            subject: `¡Bienvenido a FEISS! - Plan ${planName}`,
            name: fullName,
            plan: planName,
            price: price,
            purchaseDate: new Date()
        });

        console.log("Email de confirmación enviado:", result);
    } catch (error) {
        console.error("Error enviando email de confirmación MCP:", error);
    }
}

async function automatePostSaleFlowMCP(customerData) {
    try {
        const result = await zapierService.automatePostSaleFlow(customerData);
        console.log("Flujo post-venta automatizado:", result);
    } catch (error) {
        console.error("Error automatizando flujo post-venta:", error);
    }
}

async function handleSuccessfulPayment(paymentObject) {
    try {
        console.log("Procesando pago exitoso:", paymentObject.metadata);
        // Lógica adicional para manejar pagos exitosos
    } catch (error) {
        console.error("Error manejando pago exitoso:", error);
    }
}

async function createCustomer(email, fullName, company, planId) {
    try {
        const customer = {
            email: email,
            fullName: fullName,
            company: company,
            planId: planId,
            createdAt: new Date(),
            status: "active"
        };

        console.log("Customer created:", customer);
    } catch (error) {
        console.error("Error creating customer:", error);
    }
}

async function revokeAccess(email) {
    try {
        const orderIndex = orders.findIndex(o => o.email === email);
        if (orderIndex !== -1) {
            orders[orderIndex].status = "revoked";
        }
    } catch (error) {
        console.error("Error revoking access:", error);
    }
}

// Error handling
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
        success: false,
        message: "Error interno del servidor"
    });
});

// Start server
/**
 * POST /api/line/send-message
 * Envía un mensaje usando la API de LINE
 */
app.post("/api/line/send-message", async (req, res) => {
    try {
        const { userId, message } = req.body;
        if (!userId || !message) {
            return res.status(400).json({ success: false, message: "Se requiere userId y message para enviar un mensaje por LINE" });
        }
        const result = await lineService.sendData({ userId, message }); // Asumiendo sendData envía el mensaje
        res.json(result);
    } catch (error) {
        console.error("LINE API error:", error);
        res.status(500).json({ success: false, message: error.message || "Error al enviar mensaje con LINE" });
    }
});

app.listen(PORT, () => {
    console.log(`FEISS Enhanced Payment Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`MCP Integrations: Gmail, Google Calendar, Notion, Zapier, Hume, Instagram, Lumin PDF, Meta Ads Manager, MotherDuck, Neimo, Scite, Vercel, Alpha Vantage, Amplitude, Apify, Cal.com, Consensus, Outlook Calendar, Outlook Mail, GitHub, LINE`);
});

module.exports = app;

// Forced Vercel deployment trigger for LINE API integration
