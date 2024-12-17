import { blingRequest } from '../../wrappers/blingWrapper.cjs';
import { getValidToken } from './auth.js';

function formatDateWithOffset() {
    const date = new Date();
    date.setHours(date.getHours() - 6); // Subtract 6 hours
    return date.toISOString().replace('T', ' ').split('.')[0];
}

export async function issueNFCe(orderData) {
    try {
        const token = await getValidToken();

        if (!orderData || !orderData.OrderItems?.length) {
            throw new Error('Invalid order data: Order must have items');
        }

        const payload = {
            contato: {
                nome: orderData.contatoNome,
                tipoPessoa: orderData.contatoTipoPessoa,
                numeroDocumento: orderData.contatoDocumento,
                contribuinte: 1,
                // ...other contact fields if available
            },
            tipo: 1,
            numero: orderData.numero,
            dataOperacao: formatDateWithOffset(),
            naturezaOperacao: {
                id: 1 // This should come from configuration
            },
            loja: {
                id: orderData.lojaId
            },
            finalidade: 4,
            itens: orderData.OrderItems.map(item => ({
                codigo: item.codigo,
                descricao: item.descricao,
                unidade: item.unidade,
                quantidade: item.quantidade,
                valor: item.valor,
                tipo: item.tipo
            })),
            parcelas: orderData.parcelas?.map(parcela => ({
                data: parcela.dataVencimento,
                valor: parcela.valor,
                observacoes: parcela.observacoes,
                formaPagamento: {
                    id: parcela.formaPagamentoId
                }
            }))
        };

        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: payload
        };

        const response = await blingRequest('/nfce', options);
        
        // Handle null response from API
        if (!response || !response.data) {
            throw new Error('Empty response received from Bling API');
        }

        // Validate response structure
        if (!Array.isArray(response.data)) {
            // If response is not an array, wrap it in one to match API schema
            response.data = [response.data];
        }

        return response.data;
    } catch (error) {
        // Add specific error handling
        if (error.response?.status === 400) {
            throw new Error(`Bad request: ${error.response.data?.error?.description || 'Unknown validation error'}`);
        } else if (error.response?.status === 500) {
            throw new Error('Internal server error from Bling API');
        }
        
        console.error('Error generating NFCe:', error);
        throw error;
    }
}
