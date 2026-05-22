/**
 * FEISS Stripe Payment Server
 * Backend para procesar pagos y gestionar órdenes
 */

require('dotenv').config();

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_SECRET_KEY_HERE');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());

// Webhook de Stripe debe ir antes de bodyParser.json() para acceder al raw body
app.post('/api/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

        switch (event.type) {
            case 'payment_intent.succeeded':
                console.log('Payment succeeded:', event.data.object);
                // Lógica para actualizar la base de datos, enviar emails, etc.
                break;
            case 'payment_intent.payment_failed':
                console.log('Payment failed:', event.data.object);
                break;
            case 'charge.refunded':
                console.log('Charge refunded:', event.data.object);
                // Revocar acceso del usuario
                await revokeAccess(event.data.object.metadata.email);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({received: true});
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
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
app.post('/api/create-payment-intent', async (req, res) => {
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
                message: 'Faltan datos requeridos'
            });
        }

        // Crear payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
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

        if (paymentIntent.status === 'succeeded') {
            // Guardar orden
            const order = {
                id: paymentIntent.id,
                email: email,
                fullName: fullName,
                company: company,
                planId: planId,
                planName: planName,
                amount: amount / 100,
                currency: 'USD',
                status: 'completed',
                createdAt: new Date(),
                accessToken: generateAccessToken(email, planId)
            };

            orders.push(order);

            // Enviar email de confirmación
            await sendConfirmationEmail(email, fullName, planName, amount / 100);

            // Crear usuario en base de datos
            await createCustomer(email, fullName, company, planId);

            return res.json({
                success: true,
                message: 'Pago procesado exitosamente',
                paymentIntentId: paymentIntent.id,
                accessToken: order.accessToken
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'El pago no pudo ser procesado'
            });
        }
    } catch (error) {
        console.error('Payment error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error al procesar el pago'
        });
    }
});

/**
 * POST /api/send-confirmation-email
 * Envía email de confirmación
 */
app.post('/api/send-confirmation-email', async (req, res) => {
    try {
        const { email, name, plan, price, purchaseDate } = req.body;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `¡Bienvenido a FEISS! - Plan ${plan}`,
            html: generateEmailTemplate(name, plan, price, purchaseDate)
        };

        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: 'Email enviado exitosamente'
        });
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al enviar email'
        });
    }
});

/**
 * GET /api/orders/:email
 * Obtiene órdenes de un cliente
 */
app.get('/api/orders/:email', (req, res) => {
    try {
        const { email } = req.params;
        const customerOrders = orders.filter(order => order.email === email);

        return res.json({
            success: true,
            orders: customerOrders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener órdenes'
        });
    }
});

/**
 * POST /api/verify-access
 * Verifica si un usuario tiene acceso a un plan
 */
app.post('/api/verify-access', (req, res) => {
    try {
        const { email, accessToken } = req.body;

        const order = orders.find(o => o.email === email && o.accessToken === accessToken);

        if (order) {
            return res.json({
                success: true,
                hasAccess: true,
                plan: order.planName,
                expiresAt: calculateExpiration(order.createdAt, order.planId)
            });
        } else {
            return res.json({
                success: true,
                hasAccess: false
            });
        }
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar acceso'
        });
    }
});



/**
 * Funciones auxiliares
 */

function generateAccessToken(email, planId) {
    return Buffer.from(`${email}:${planId}:${Date.now()}`).toString('base64');
}

function calculateExpiration(createdAt, planId) {
    const expirationDays = {
        'basic': 180,
        'professional': 365,
        'enterprise': 730
    };

    const days = expirationDays[planId] || 365;
    const expirationDate = new Date(createdAt);
    expirationDate.setDate(expirationDate.getDate() + days);

    return expirationDate;
}

function generateEmailTemplate(name, plan, price, purchaseDate) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Geist', sans-serif; color: #1f2937; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 20px; border-radius: 8px; }
                .content { padding: 20px 0; }
                .plan-details { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .button { background: #f59e0b; color: #0f172a; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 20px; font-weight: 600; }
                .footer { color: #6b7280; font-size: 0.9rem; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Bienvenido a FEISS!</h1>
                    <p>Tu compra ha sido procesada exitosamente</p>
                </div>

                <div class="content">
                    <p>Hola <strong>${name}</strong>,</p>
                    
                    <p>Gracias por comprar el plan <strong>${plan}</strong> de FEISS Showcase Store. Tu acceso ha sido activado inmediatamente.</p>

                    <div class="plan-details">
                        <h3>Detalles de tu Compra</h3>
                        <p><strong>Plan:</strong> ${plan}</p>
                        <p><strong>Precio:</strong> $${price}</p>
                        <p><strong>Fecha:</strong> ${new Date(purchaseDate).toLocaleDateString('es-ES')}</p>
                        <p><strong>Estado:</strong> <span style="color: #10b981;">✓ Completado</span></p>
                    </div>

                    <h3>Próximos Pasos</h3>
                    <ol>
                        <li>Accede a tu cuenta con este email</li>
                        <li>Descarga la documentación completa</li>
                        <li>Comienza con la guía de implementación</li>
                        <li>Contacta soporte si tienes preguntas</li>
                    </ol>

                    <a href="https://feiss.dev/dashboard" class="button">Ir a Mi Cuenta</a>

                    <div class="footer">
                        <p>Si tienes preguntas, contacta a <strong>feispla@hotmail.com</strong></p>
                        <p>&copy; 2026 FEISS. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

async function sendConfirmationEmail(email, fullName, planName, price) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `¡Bienvenido a FEISS! - Plan ${planName}`,
            html: generateEmailTemplate(fullName, planName, price, new Date())
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}

async function createCustomer(email, fullName, company, planId) {
    try {
        // En producción, guardar en base de datos
        const customer = {
            email: email,
            fullName: fullName,
            company: company,
            planId: planId,
            createdAt: new Date(),
            status: 'active'
        };

        console.log('Customer created:', customer);
        // db.customers.insert(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
    }
}

async function revokeAccess(email) {
    try {
        // Revocar acceso del usuario
        const orderIndex = orders.findIndex(o => o.email === email);
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'revoked';
        }
    } catch (error) {
        console.error('Error revoking access:', error);
    }
}

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`FEISS Payment Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
