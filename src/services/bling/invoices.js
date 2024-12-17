import { blingRequest } from '../../wrappers/blingWrapper.cjs';
import { getValidToken } from './auth.js';

async function generateInvoice(orderId) {
    try {
        const token = await getValidToken();
        
        // Generate invoice request
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const response = await blingRequest(`/pedidos/vendas/${orderId}/gerar-nfe`, options);
        
        if (!response.data) {
            throw new Error('Failed to generate invoice');
        }

        return response.data;
    } catch (error) {
        console.error('Error generating invoice:', error);
        throw new Error(error.response?.data?.error?.description || 'Failed to generate invoice');
    }
}

async function getInvoiceStatus(invoiceId) {
    try {
        const token = await getValidToken();
        
        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const response = await blingRequest(`/nfe/${invoiceId}`, options);
        
        if (!response.data) {
            throw new Error('Failed to get invoice status');
        }

        return response.data;
    } catch (error) {
        console.error('Error getting invoice status:', error);
        throw new Error(error.response?.data?.error?.description || 'Failed to get invoice status');
    }
}

export { generateInvoice, getInvoiceStatus };
