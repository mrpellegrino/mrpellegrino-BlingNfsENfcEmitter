const axios = require('axios');

const BLING_API_URL = 'https://www.bling.com.br/Api/v3';

async function blingRequest(endpoint, options = {}) {
    try {
        const { params, ...restOptions } = options;
        const response = await axios({
            url: `${BLING_API_URL}${endpoint}`,
            params,
            ...restOptions
        });
        return response.data;
    } catch (error) {
        console.error('Bling API error:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    blingRequest
};
