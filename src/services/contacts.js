import { blingRequest } from '../wrappers/blingWrapper.cjs';
import { getValidToken } from './bling/auth.js';
import { saveContact } from '../repositories/contacts.js';

export async function fetchAndSaveContact(idContato) {
    try {
        const token = await getValidToken();
        
        const response = await blingRequest(`/contatos/${idContato}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.error) {
            throw new Error(response.error.description || 'Failed to fetch contact');
        }

        const contactData = response.data;
        
        // Transform API data to match our model structure
        const formattedContact = {
            id: contactData.id,
            nome: contactData.nome,
            codigo: contactData.codigo,
            situacao: contactData.situacao,
            numeroDocumento: contactData.numeroDocumento,
            telefone: contactData.telefone,
            celular: contactData.celular,
            fantasia: contactData.fantasia,
            tipo: contactData.tipo,
            indicadorIe: contactData.indicadorIe,
            ie: contactData.ie,
            rg: contactData.rg,
            orgaoEmissor: contactData.orgaoEmissor,
            email: contactData.email,
            enderecoGeral: contactData.endereco?.geral || null,
            enderecoCobranca: contactData.endereco?.cobranca || null,
            vendedorId: contactData.vendedor?.id || null,
            dadosAdicionais: contactData.dadosAdicionais || null,
            financeiro: contactData.financeiro || null,
            pais: contactData.pais || null,
            tiposContato: contactData.tiposContato || null,
            pessoasContato: contactData.pessoasContato || null
        };

        // Save to database
        const savedContact = await saveContact(formattedContact);
        return savedContact;

    } catch (error) {
        console.error('Error in fetchAndSaveContact:', error);
        throw error;
    }
}

export async function fetchSingleContact(idContato) {
    try {
        const token = await getValidToken();
        
        const response = await blingRequest(`/contatos/${idContato}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.error) {
            throw new Error(response.error.description || 'Failed to fetch contact');
        }

        console.log('Contact data:', JSON.stringify(response.data, null, 2));
        return response.data;

    } catch (error) {
        console.error('Error fetching contact:', error);
        throw error;
    }
}
