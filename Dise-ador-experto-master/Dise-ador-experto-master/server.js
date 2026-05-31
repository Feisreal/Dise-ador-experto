/**
 * FEISS Enhanced Payment Server with Stripe Integration - IMPROVED VERSION
 * Backend mejorado con integraciones de Stripe, Gmail, Google Calendar, Notion y Zapier
 * 
 * CAMBIOS REALIZADOS:
 * 1. Configuración mejorada de CORS
 * 2. Manejo completo de estados de PaymentIntent
 * 3. Endpoint de confirmación de email
 * 4. Soporte para suscripciones
 * 5. Mejor manejo de errores
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

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// CONFIGURACIÓN MEJORADA DE CORS
// ============================================================================
const allowedOrigins = [
    'https://feispla.vercel.app',
    'https://www.feispla.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173', // Vite
    process.env.DOMAIN
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================================================
// WEBHOOK DE STRIPE - DEBE IR ANTES DE bodyParser.json()
// ============================================================================
app.post("/api/webhook/stripe", express.raw({type: "application/json"}), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("⚠️  STRIPE_WEBHOOK_SECRET no está configurado");
        return res.status(400).send("Webhook secret not configured");
    }

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        console.log(`✅ Webhook verificado: ${event.type}`);

        switch (event.type) {
            case "payment_intent.succeeded":
                console.log("✅ Payment succeeded:", event.data.object.id);
                await handleSuccessfulPayment(event.data.object);
                break;

            case "payment_intent.payment_failed":
                console.log("❌ Payment failed:", event.data.object.id);
                await handleFailedPayment(event.data.object);
                break;

            case "charge.refunded":
                console.log("💰 Charge refunded:", event.data.object.id);
                await revokeAccess(event.data.object.metadata?.email);
                break;

            case "invoice.payment_succeeded":
                console.log("✅ Invoice payment succeeded:", event.data.object.id);
                await handleInvoicePaymentSucceeded(event.data.object);
                break;

            case "invoice.payment_failed":
                console.log("❌ Invoice payment failed:", event.data.object.id);
                await handleInvoicePaymentFailed(event.data.object);
                break;

            default:
                console.log(`⚠️  Unhandled event type: ${event.type}`);
        }

        res.json({received: true});
    } catch (error) {
        console.error("❌ Webhook error:", error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// ============================================================================
// EMAIL CONFIGURATION
// ============================================================================
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// ============================================================================
// DATABASE SIMULATION (usar MongoDB, PostgreSQL, etc. en producción)
// ============================================================================
const orders = [];
const subscriptions = [];

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function generateAccessToken(email, planId) {
    return Buffer.from(`${email}:${planId}:${Date.now()}`).toString('base64');
}

async function handleSuccessfulPayment(paymentIntent) {
    try {
        console.log("Processing successful payment:", paymentIntent.id);
        // Aquí puedes agregar lógica adicional como:
        // - Actualizar base de datos
        // - Crear usuario
        // - Enviar email
    } catch (error) {
        console.error("Error handling successful payment:", error);
    }
}

async function handleFailedPayment(paymentIntent) {
    try {
        console.log("Processing failed payment:", paymentIntent.id);
        // Aquí puedes agregar lógica para notificar al usuario
    } catch (error) {
        console.error("Error handling failed payment:", error);
    }
}

async function handleInvoicePaymentSucceeded(invoice) {
    try {
        console.log("Processing invoice payment:", invoice.id);
        // Lógica para suscripciones
    } catch (error) {
        console.error("Error handling invoice payment:", error);
    }
}

async function handleInvoicePaymentFailed(invoice) {
    try {
        console.log("Processing failed invoice:", invoice.id);
        // Notificar al usuario sobre fallo de suscripción
    } catch (error) {
        console.error("Error handling failed invoice:", error);
    }
}

async function revokeAccess(email) {
    try {
        if (!email) return;
        console.log("Revoking access for:", email);
        // Aquí puedes agregar lógica para revocar acceso
    } catch (error) {
        console.error("Error revoking access:", error);
    }
}

async function sendConfirmationEmailMCP(email, fullName, planName, amount) {
    try {
        await gmailService.sendConfirmationEmail({
            to: email,
            subject: `Confirmación de Compra - ${planName}`,
            name: fullName,
            plan: planName,
            price: amount,
            purchaseDate: new Date()
        });
    } catch (error) {
        console.error("Error sending confirmation email via MCP:", error);
    }
}

async function automatePostSaleFlowMCP(data) {
    try {
        await zapierService.triggerWorkflow('post_sale_flow', data);
    } catch (error) {
        console.error("Error automating post-sale flow:", error);
    }
}

async function createCustomer(email, fullName, company, planId) {
    try {
        const customer = await stripe.customers.create({
            email: email,
            name: fullName,
            metadata: {
                company: company,
                planId: planId,
                createdAt: new Date().toISOString()
            }
        });
        return customer;
    } catch (error) {
        console.error("Error creating customer:", error);
        throw error;
    }
}

// ============================================================================
// RUTAS DE PAGO
// ============================================================================

/**
 * POST /api/create-payment-intent
 * Crea un payment intent y procesa el pago
 * 
 * Body:
 * {
 *   paymentMethodId: string,
 *   amount: number (en centavos),
 *   email: string,
 *   fullName: string,
 *   company?: string,
 *   planId: string,
 *   planName: string,
 *   currency?: string (default: usd)
 * }
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
            planName,
            currency = 'usd'
        } = req.body;

        // Validación
        if (!paymentMethodId || !amount || !email || !fullName) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos requeridos: paymentMethodId, amount, email, fullName"
            });
        }

        if (amount < 50) {
            return res.status(400).json({
                success: false,
                message: "El monto mínimo es $0.50 USD"
            });
        }

        console.log(`Creating payment intent for ${email}: $${amount/100} ${currency.toUpperCase()}`);

        // Crear payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency: currency.toLowerCase(),
            payment_method: paymentMethodId,
            confirm: true,
            description: `FEISS ${planName} Plan - ${fullName}`,
            metadata: {
                email: email,
                fullName: fullName,
                company: company || 'N/A',
                planId: planId,
                planName: planName
            },
            receipt_email: email,
            return_url: `${process.env.DOMAIN || 'http://localhost:3000'}/payment-result`
        });

        console.log(`Payment intent status: ${paymentIntent.status}`);

        // Manejar diferentes estados
        if (paymentIntent.status === "succeeded") {
            // Pago completado exitosamente
            const order = {
                id: paymentIntent.id,
                email: email,
                fullName: fullName,
                company: company || 'N/A',
                planId: planId,
                planName: planName,
                amount: amount / 100,
                currency: currency.toUpperCase(),
                status: "completed",
                createdAt: new Date(),
                accessToken: generateAccessToken(email, planId)
            };

            orders.push(order);

            // Enviar email de confirmación
            await sendConfirmationEmailMCP(email, fullName, planName, amount / 100);

            // Automatizar flujo post-venta
            await automatePostSaleFlowMCP({
                email: email,
                name: fullName,
                plan: planName,
                amount: amount / 100,
                company: company || 'N/A'
            });

            // Crear cliente en Stripe
            await createCustomer(email, fullName, company, planId);

            return res.json({
                success: true,
                message: "Pago procesado exitosamente",
                paymentIntentId: paymentIntent.id,
                accessToken: order.accessToken,
                status: "succeeded"
            });

        } else if (paymentIntent.status === "requires_action") {
            // Requiere autenticación 3D Secure
            return res.json({
                success: false,
                message: "Se requiere autenticación adicional",
                requiresAction: true,
                clientSecret: paymentIntent.client_secret,
                status: "requires_action"
            });

        } else if (paymentIntent.status === "requires_payment_method") {
            // El método de pago fue rechazado
            return res.status(400).json({
                success: false,
                message: "El método de pago fue rechazado. Por favor intenta con otro.",
                status: "requires_payment_method"
            });

        } else {
            return res.status(400).json({
                success: false,
                message: `El pago no pudo ser procesado. Estado: ${paymentIntent.status}`,
                status: paymentIntent.status
            });
        }

    } catch (error) {
        console.error("❌ Payment error:", error);
        
        // Manejar errores específicos de Stripe
        let message = "Error al procesar el pago";
        let statusCode = 500;

        if (error.type === 'StripeCardError') {
            message = `Error de tarjeta: ${error.message}`;
            statusCode = 400;
        } else if (error.type === 'StripeInvalidRequestError') {
            message = `Error en la solicitud: ${error.message}`;
            statusCode = 400;
        } else if (error.type === 'StripeAPIError') {
            message = "Error en la API de Stripe. Por favor intenta más tarde.";
            statusCode = 503;
        }

        return res.status(statusCode).json({
            success: false,
            message: message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * POST /api/create-subscription
 * Crea una suscripción en Stripe
 */
app.post("/api/create-subscription", async (req, res) => {
    try {
        const { email, fullName, priceId, company, planName } = req.body;

        if (!email || !priceId) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos requeridos: email, priceId"
            });
        }

        console.log(`Creating subscription for ${email} with price ${priceId}`);

        // Crear o recuperar cliente
        let customer = await stripe.customers.list({
            email: email,
            limit: 1
        });

        let customerId;
        if (customer.data.length > 0) {
            customerId = customer.data[0].id;
        } else {
            const newCustomer = await stripe.customers.create({
                email: email,
                name: fullName,
                metadata: {
                    company: company || 'N/A',
                    planName: planName
                }
            });
            customerId = newCustomer.id;
        }

        // Crear suscripción
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent']
        });

        subscriptions.push({
            id: subscription.id,
            customerId: customerId,
            email: email,
            priceId: priceId,
            status: subscription.status,
            createdAt: new Date()
        });

        return res.json({
            success: true,
            message: "Suscripción creada exitosamente",
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
            status: subscription.status
        });

    } catch (error) {
        console.error("❌ Subscription error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error al crear la suscripción"
        });
    }
});

/**
 * POST /api/send-confirmation-email
 * Envía email de confirmación de compra
 */
app.post("/api/send-confirmation-email", async (req, res) => {
    try {
        const { email, name, plan, price, purchaseDate } = req.body;

        if (!email || !name || !plan) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos requeridos: email, name, plan"
            });
        }

        console.log(`Sending confirmation email to ${email}`);

        // Usar Gmail MCP si está disponible
        if (gmailService) {
            await sendConfirmationEmailMCP(email, name, plan, price);
        } else {
            // Fallback a Nodemailer
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Confirmación de Compra - ${plan}`,
                html: `
                    <h2>¡Gracias por tu compra!</h2>
                    <p>Hola ${name},</p>
                    <p>Tu compra del plan <strong>${plan}</strong> ha sido confirmada.</p>
                    <p><strong>Monto:</strong> $${price} USD</p>
                    <p><strong>Fecha:</strong> ${new Date(purchaseDate).toLocaleDateString('es-ES')}</p>
                    <p>Acceso activado. Revisa tu cuenta para comenzar.</p>
                    <p>¿Preguntas? Contáctanos en feispla@hotmail.com</p>
                `
            });
        }

        return res.json({
            success: true,
            message: "Email de confirmación enviado"
        });

    } catch (error) {
        console.error("❌ Email error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error al enviar email"
        });
    }
});

/**
 * GET /api/payment-status/:paymentIntentId
 * Obtiene el estado de un payment intent
 */
app.get("/api/payment-status/:paymentIntentId", async (req, res) => {
    try {
        const { paymentIntentId } = req.params;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        return res.json({
            success: true,
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            email: paymentIntent.receipt_email,
            metadata: paymentIntent.metadata
        });

    } catch (error) {
        console.error("❌ Status check error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error al obtener estado del pago"
        });
    }
});

/**
 * POST /api/create-refund
 * Crea un reembolso
 */
app.post("/api/create-refund", async (req, res) => {
    try {
        const { paymentIntentId, amount, reason } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: "Se requiere paymentIntentId"
            });
        }

        console.log(`Creating refund for ${paymentIntentId}`);

        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount ? Math.round(amount) : undefined,
            reason: reason || 'requested_by_customer',
            metadata: {
                refundedAt: new Date().toISOString()
            }
        });

        return res.json({
            success: true,
            message: "Reembolso procesado",
            refundId: refund.id,
            status: refund.status
        });

    } catch (error) {
        console.error("❌ Refund error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error al procesar reembolso"
        });
    }
});

// ============================================================================
// RUTAS DE DEMOSTRACIÓN
// ============================================================================

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
        console.error("❌ Demo booking error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error al reservar la demo"
        });
    }
});

// ============================================================================
// RUTAS DE SOPORTE
// ============================================================================

/**
 * POST /api/support-ticket
 * Crea un ticket de soporte
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
        console.error("❌ Support ticket error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error al crear el ticket de soporte"
        });
    }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
        webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
        emailConfigured: !!process.env.EMAIL_USER
    });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
    console.error("❌ Unhandled error:", err);
    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║     FEISS Payment Server - IMPROVED VERSION                ║
║     Escuchando en puerto ${PORT}                              ║
╠════════════════════════════════════════════════════════════╣
║ ✅ Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configurado' : '❌ NO CONFIGURADO'}
║ ✅ Webhook: ${process.env.STRIPE_WEBHOOK_SECRET ? 'Configurado' : '❌ NO CONFIGURADO'}
║ ✅ Email: ${process.env.EMAIL_USER ? 'Configurado' : '❌ NO CONFIGURADO'}
║ ✅ Entorno: ${process.env.NODE_ENV || 'development'}
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
