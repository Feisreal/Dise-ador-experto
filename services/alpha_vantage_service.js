const axios = require('axios');

class AlphaVantageService {
    constructor() {
        this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || '3COZQPWB9RAON39Q';
        this.baseUrl = process.env.ALPHA_VANTAGE_BASE_URL || 'https://www.alphavantage.co/query';
    }

    async getStockQuote(symbol) {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    function: 'GLOBAL_QUOTE',
                    symbol: symbol,
                    apikey: this.apiKey
                }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new AlphaVantageService();
