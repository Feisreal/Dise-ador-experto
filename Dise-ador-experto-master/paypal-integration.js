/**
 * PayPal Integration Module
 * Integración con PayPal usando MCP para procesamiento de pagos
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class PayPalIntegration {
    constructor(clientId, clientSecret, mode = 'sandbox') {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.mode = mode;
        this.baseUrl = mode === 'sandbox' 
            ? 'https://api-m.sandbox.paypal.com'
            : 'https://api-m.paypal.com';
    }

    /**
     * Crear orden de PayPal
     */
    async createOrder(amount, planName, email, fullName) {
        try {
            const orderData = {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'USD',
                        value: amount.toString()
                    },
                    description: `FEISS ${planName} Plan`,
                    custom_id: email
                }],
                payer: {
                    email_address: email,
                    name: {
                        given_name: fullName.split(' ')[0],
                        surname: fullName.split(' ').slice(1).join(' ')
                    }
                },
                application_context: {
                    brand_name: 'FEISS Showcase Store',
                    locale: 'es-ES',
                    user_action: 'PAY_NOW',
                    return_url: 'http://localhost:3001/paypal/return',
                    cancel_url: 'http://localhost:3001/paypal/cancel'
                }
            };

            // Usar MCP para crear orden
            const command = `manus-mcp-cli tool call create_order --server paypal-for-business --input '${JSON.stringify(orderData)}'`;
            
            const { stdout, stderr } = await execPromise(command);
            
            if (stderr) {
                console.error('PayPal MCP Error:', stderr);
                throw new Error('Error al crear orden en PayPal');
            }

            const result = JSON.parse(stdout);
            
            if (result.success) {
                return {
                    success: true,
                    orderId: result.id,
                    status: result.status,
                    links: result.links
                };
            } else {
                throw new Error(result.message || 'Error desconocido en PayPal');
            }
        } catch (error) {
            console.error('PayPal Order Creation Error:', error);
            throw error;
        }
    }

    /**
     * Capturar pago de orden
     */
    async captureOrder(orderId) {
        try {
            const command = `manus-mcp-cli tool call capture_order --server paypal-for-business --input '{"order_id": "${orderId}"}'`;
            
            const { stdout, stderr } = await execPromise(command);
            
            if (stderr) {
                console.error('PayPal MCP Error:', stderr);
                throw new Error('Error al capturar orden en PayPal');
            }

            const result = JSON.parse(stdout);
            
            if (result.success) {
                return {
                    success: true,
                    orderId: result.id,
                    status: result.status,
                    paymentSource: result.payment_source,
                    purchaseUnits: result.purchase_units
                };
            } else {
                throw new Error(result.message || 'Error desconocido en PayPal');
            }
        } catch (error) {
            console.error('PayPal Capture Error:', error);
            throw error;
        }
    }

    /**
     * Obtener detalles de orden
     */
    async getOrderDetails(orderId) {
        try {
            const command = `manus-mcp-cli tool call get_order --server paypal-for-business --input '{"order_id": "${orderId}"}'`;
            
            const { stdout, stderr } = await execPromise(command);
            
            if (stderr) {
                console.error('PayPal MCP Error:', stderr);
                throw new Error('Error al obtener detalles de orden');
            }

            const result = JSON.parse(stdout);
            return result;
        } catch (error) {
            console.error('PayPal Get Order Error:', error);
            throw error;
        }
    }

    /**
     * Reembolsar pago
     */
    async refundPayment(captureId, amount) {
        try {
            const refundData = {
                amount: amount.toString()
            };

            const command = `manus-mcp-cli tool call refund_capture --server paypal-for-business --input '{"capture_id": "${captureId}", "amount": "${amount}"}'`;
            
            const { stdout, stderr } = await execPromise(command);
            
            if (stderr) {
                console.error('PayPal MCP Error:', stderr);
                throw new Error('Error al procesar reembolso');
            }

            const result = JSON.parse(stdout);
            
            if (result.success) {
                return {
                    success: true,
                    refundId: result.id,
                    status: result.status,
                    amount: result.amount
                };
            } else {
                throw new Error(result.message || 'Error desconocido en PayPal');
            }
        } catch (error) {
            console.error('PayPal Refund Error:', error);
            throw error;
        }
    }

    /**
     * Crear factura
     */
    async createInvoice(invoiceData) {
        try {
            const command = `manus-mcp-cli tool call create_invoice --server paypal-for-business --input '${JSON.stringify(invoiceData)}'`;
            
            const { stdout, stderr } = await execPromise(command);
            
            if (stderr) {
                console.error('PayPal MCP Error:', stderr);
                throw new Error('Error al crear factura');
            }

            const result = JSON.parse(stdout);
            return result;
        } catch (error) {
            console.error('PayPal Invoice Error:', error);
            throw error;
        }
    }

    /**
     * Crear suscripción
     */
    async createSubscription(planData) {
        try {
            const command = `manus-mcp-cli tool call create_subscription --server paypal-for-business --input '${JSON.stringify(planData)}'`;
            
            const { stdout, stderr } = await execPromise(command);
            
            if (stderr) {
                console.error('PayPal MCP Error:', stderr);
                throw new Error('Error al crear suscripción');
            }

            const result = JSON.parse(stdout);
            return result;
        } catch (error) {
            console.error('PayPal Subscription Error:', error);
            throw error;
        }
    }
}

module.exports = PayPalIntegration;
