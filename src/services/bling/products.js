import { blingRequest } from '../../wrappers/blingWrapper.cjs';
import { getValidToken } from './auth.js';

export async function getProductById(productId) {
    try {
        const token = await getValidToken();
        const options = {
            method: 'GET',
            params: {
                'idsProdutos[]': productId
            },
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const response = await blingRequest('/produtos', options);
        return response.data[0];
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
}
