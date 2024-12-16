import { blingRequest } from '../../wrappers/blingWrapper.cjs';
import { getValidToken } from './auth.js';

export async function issueNFSe(orderData) {
    try {
        const token = await getValidToken();
        
        const nfseData = {
            contato: {
                nome: orderData.contatoNome,
                tipoPessoa: orderData.contatoTipoPessoa,
                numeroDocumento: orderData.contatoDocumento,
                email: orderData.contatoDocumento,
                endereco: {
                    uf: "MG"
                }
            },
            naturezaOperacao: {
                id: 1
            },
            tipo: 1,
            dataOperacao: orderData.dataSaida,
            servicos: orderData.OrderItems.map(item => ({
                codigo: item.codigo,
                descricao: item.descricao,
                quantidade: parseFloat(item.quantidade),
                valor: parseFloat(item.valor),
                unidade: item.unidade,
                codigoServico: "14.01"
            }))
        };

        console.log('NFSe request payload:', JSON.stringify(nfseData, null, 2));

        const response = await blingRequest('/nfse', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: nfseData
        });

        if (response.error) {
            console.log('Bling API error:', response);
            if (response.error.fields) {
                console.log('\nValidation Errors:');
                response.error.fields.forEach((field, index) => {
                    console.log(`${index + 1}. Field: ${field.name}`);
                    console.log(`   Message: ${field.message}`);
                });
            }
            throw new Error(response.error.description || 'Failed to issue NFSe');
        }

        return response.data;
    } catch (error) {
        console.error('Error issuing NFSe:', error);
        throw new Error(`Failed to issue NFSe: ${error.message}`);
    }
}
