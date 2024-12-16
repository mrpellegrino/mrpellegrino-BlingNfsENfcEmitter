import { blingRequest } from '../../wrappers/blingWrapper.cjs';
import { getValidToken } from './auth.js';

async function getOrderByCode(orderNumber) {
    try {
        const token = await getValidToken();

        // First request - Get order by number to retrieve ID
        const optionsFirstRequest = {
            method: 'GET',
            params: {
                numero: orderNumber
            },
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const firstResponse = await blingRequest('/pedidos/vendas', optionsFirstRequest);

        if (!firstResponse.data || firstResponse.data.length === 0) {
            throw new Error(`Order number ${orderNumber} not found`);
        }

        const orderId = firstResponse.data[0].id;

        // Second request - Get complete order details by ID
        const optionsSecondRequest = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const response = await blingRequest(`/pedidos/vendas/${orderId}`, optionsSecondRequest);

        if (!response.data) {
            throw new Error(`Order ID ${orderId} not found`);
        }

        // Format response to match expected structure
        const mappedOrder = {
            data: {
                id: response.data.id,
                numero: response.data.numero,
                numeroLoja: response.data.numeroLoja,
                data: response.data.data,
                dataSaida: response.data.dataSaida,
                dataPrevista: response.data.dataPrevista,
                totalProdutos: response.data.totalProdutos,
                total: response.data.total,
                contato: {
                    id: response.data.contato?.id,
                    nome: response.data.contato?.nome,
                    tipoPessoa: response.data.contato?.tipoPessoa,
                    numeroDocumento: response.data.contato?.numeroDocumento
                },
                situacao: {
                    id: response.data.situacao?.id,
                    valor: response.data.situacao?.valor
                },
                loja: {
                    id: response.data.loja?.id
                },
                numeroPedidoCompra: response.data.numeroPedidoCompra,
                outrasDespesas: response.data.outrasDespesas,
                observacoes: response.data.observacoes,
                observacoesInternas: response.data.observacoesInternas,
                desconto: {
                    valor: response.data.desconto?.valor,
                    unidade: response.data.desconto?.unidade
                },
                categoria: {
                    id: response.data.categoria?.id
                },
                notaFiscal: {
                    id: response.data.notaFiscal?.id
                },
                tributacao: {
                    totalICMS: response.data.tributacao?.totalICMS,
                    totalIPI: response.data.tributacao?.totalIPI
                },
                itens: response.data.itens?.map(item => ({
                    id: item.id,
                    codigo: item.codigo,
                    unidade: item.unidade,
                    quantidade: item.quantidade,
                    desconto: item.desconto,
                    valor: item.valor,
                    aliquotaIPI: item.aliquotaIPI,
                    descricao: item.descricao,
                    descricaoDetalhada: item.descricaoDetalhada,
                    produto: {
                        id: item.produto?.id
                    },
                    comissao: {
                        base: item.comissao?.base,
                        aliquota: item.comissao?.aliquota,
                        valor: item.comissao?.valor
                    }
                })),
                parcelas: response.data.parcelas?.map(parcela => ({
                    id: parcela.id,
                    dataVencimento: parcela.dataVencimento,
                    valor: parcela.valor,
                    observacoes: parcela.observacoes,
                    formaPagamento: {
                        id: parcela.formaPagamento?.id
                    }
                })),
                transporte: {
                    fretePorConta: response.data.transporte?.fretePorConta,
                    frete: response.data.transporte?.frete,
                    quantidadeVolumes: response.data.transporte?.quantidadeVolumes,
                    pesoBruto: response.data.transporte?.pesoBruto,
                    prazoEntrega: response.data.transporte?.prazoEntrega,
                    contato: {
                        id: response.data.transporte?.contato?.id,
                        nome: response.data.transporte?.contato?.nome
                    },
                    etiqueta: response.data.transporte?.etiqueta,
                    volumes: response.data.transporte?.volumes?.map(volume => ({
                        id: volume.id,
                        servico: volume.servico,
                        codigoRastreamento: volume.codigoRastreamento
                    }))
                },
                vendedor: {
                    id: response.data.vendedor?.id
                },
                intermediador: response.data.intermediador,
                taxas: response.data.taxas
            }
        };

        console.log('Order:', JSON.stringify(mappedOrder, null, 2));
        return mappedOrder;
    } catch (error) {
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error.description || 'Failed to fetch order');
        }
        throw error;
    }
}

export { getOrderByCode };
