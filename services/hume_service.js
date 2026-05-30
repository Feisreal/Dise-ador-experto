const axios = require('axios');

class HumeService {
    constructor() {
        this.apiKey = process.env.HUME_API_KEY;
    }

    async analyzeEmotion(text) {
        try {
            const response = await axios.post('https://api.hume.ai/v1/emotion', {
                text: text
            }, {
                headers: { 'X-Hume-Access-Token': this.apiKey }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new HumeService();
