import { blingRequest } from '../../wrappers/blingWrapper.cjs';
import { getValidToken } from './auth.js';

async function getContactById(contactId) {
    try {
        const token = await getValidToken();
        const optionsRequest = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        
        const response = await blingRequest(`/contatos/${contactId}`, optionsRequest);

        if (!response.data) {
            throw new Error(`Contact ID ${contactId} not found`);
        }

        return response.data;

    } catch (error) {
        // Improved error handling for specific Bling API errors
        if (error.response?.data?.error) {
            const apiError = error.response.data.error;
            if (apiError.type === 'RESOURCE_NOT_FOUND') {
                throw new Error(`Contact ID ${contactId} was not found in the system`);
            }
            throw new Error(apiError.description || 'Failed to fetch contact');
        }
        throw error;
    }
}

export { getContactById };

