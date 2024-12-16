import { blingRequest } from '../../wrappers/blingWrapper.cjs';
import { getValidToken } from './auth.js';

export async function issueNFCe(orderData) {
    try {
        const token = await getValidToken();
        
        const nfceData = {
            contato: {
                nome: orderData.contatoNome,
                tipoPessoa: orderData.contatoTipoPessoa,
                numeroDocumento: orderData.contatoDocumento,
                contribuinte: 1,
                ie: "",
                rg: "",
                telefone: "",
                email: "",
                endereco: {
                    endereco: "",
                    bairro: "",
                    municipio: "",
                    numero: "",
                    complemento: "",
                    cep: "",
                    uf: "MG",  // Required field
                    pais: "Brasil"
                }
            },
            tipo: 1,
            numero: orderData.numero,
            dataOperacao: orderData.data,
            naturezaOperacao: {
                id: 1  // This should be configured according to your needs
            },
            loja: {
                id: orderData.lojaId,
                numero: orderData.numeroLoja
            },
            finalidade: 1,
            seguro: 0,
            despesas: 0,
            desconto: orderData.descontoValor || 0,
            observacoes: orderData.observacoes || "",
            itens: orderData.OrderItems?.map(item => ({
                codigo: item.codigo,
                descricao: item.descricao,
                unidade: item.unidade,
                quantidade: parseFloat(item.quantidade),
                valor: parseFloat(item.valor),
                tipo: "P",
                pesoBruto: 0,
                pesoLiquido: 0,
                numeroPedidoCompra: "",
                classificacaoFiscal: "",
                cest: "",
                codigoServico: "",
                origem: 0,
                informacoesAdicionais: ""
            })) || [],
            parcelas: orderData.OrderInstallments?.map(parcela => ({
                data: parcela.dataVencimento,
                valor: parseFloat(parcela.valor),
                observacoes: parcela.observacoes || "",
                formaPagamento: {
                    id: parcela.formaPagamentoId
                }
            })) || []
        };

        console.log('NFCe request payload:', JSON.stringify(nfceData, null, 2));

        const response = await blingRequest('/nfce', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: nfceData
        });

        if (response.error) {
            console.error('Bling API error:', response);
            if (response.error.fields) {
                console.log('\nValidation Errors:');
                response.error.fields.forEach((field, index) => {
                    console.log(`${index + 1}. Field: ${field.name}`);
                    console.log(`   Message: ${field.message}`);
                });
            }
            throw new Error(response.error.description || 'Failed to issue NFCe');
        }

        return response.data;
    } catch (error) {
        console.error('Error issuing NFCe:', error);
        throw error;
    }
}
