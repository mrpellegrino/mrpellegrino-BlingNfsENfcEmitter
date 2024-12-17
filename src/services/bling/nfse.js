import { blingRequest } from '../../wrappers/blingWrapper.cjs';
import { getValidToken } from './auth.js';
import { Contact } from '../../models/index.js';
import { getServiceCode } from '../../repositories/configRepository.js';

export async function issueNFSe(orderData) {
    try {
        const token = await getValidToken();
        const serviceCode = await getServiceCode();

        // Get contact details from database
        const contact = await Contact.findOne({
            where: { id: orderData.contactId }
        });

        if (!contact) {
            throw new Error('Contact not found in database');
        }

        const payload = {
            // Contact information from database
            contato: {
                id: contact.blingId,
                nome: contact.nome,
                numeroDocumento: contact.numeroDocumento,
                email: contact.email || '',
                ie: contact.ie || '',
                telefone: contact.telefone || '',
                im: contact.im || '',
                endereco: {
                    bairro: contact.bairro || '',
                    municipio: contact.municipio || '',
                    endereco: contact.endereco || '',
                    numero: contact.numero || '',
                    complemento: contact.complemento || '',
                    cep: contact.cep || '',
                    uf: contact.uf || ''
                }
            },

            // Required root fields
            numeroRPS: orderData.numero,
            serie: orderData.serie || '1',
            numero: orderData.numero,
            dataEmissao: new Date().toISOString(),
            data: new Date().toISOString(),
            reterISS: false,
            desconto: orderData.descontoValor || 0,

            // Services array
            servicos: orderData.OrderItems.map(item => ({
                codigo: serviceCode,
                descricao: item.descricao,
                valor: parseFloat(item.valor)
            })),

            // Vendor information
            vendedor: 1,
            // Payment installments
            parcelas: orderData.parcelas?.map(parcela => ({
                data: parcela.dataVencimento,
                valor: parseFloat(parcela.valor),
                observacoes: parcela.observacoes || '',
                formaPagamento: {
                    id: parcela.formaPagamento?.id || 1
                }
            })) || [{
                data: new Date().toISOString(),
                valor: parseFloat(orderData.total),
                observacoes: 'Pagamento à vista',
                formaPagamento: { id: 1 }
            }]
        };

        console.log('NFSe Payload:', JSON.stringify(payload, null, 2));
        console.log('----------------------------------------');

        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: payload
        };

        const response = await blingRequest('/nfse', options);
        
        if (!response.data) {
            throw new Error('Failed to generate NFSe');
        }

        return response.data;
    } catch (error) {
        console.error('Error generating NFSe:', error);
        throw error;
    }
}
