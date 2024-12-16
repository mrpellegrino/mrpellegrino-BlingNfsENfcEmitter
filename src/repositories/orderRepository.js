import { Order, OrderItem, OrderInstallment, Contact } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { getProductById } from '../services/bling/products.js';
import { getContactById } from '../services/bling/contacts.js';

export async function saveOrder(orderData) {
    const transaction = await sequelize.transaction();
    try {
        console.log('\nSaving order...');
        console.log('Checking for existing order with blingId:', orderData.id);

        // Check for existing order by blingId with detailed logging
        const existingOrder = await Order.findOne({ 
            where: { blingId: orderData.id },
            transaction 
        });

        if (existingOrder) {
            console.log('Found existing order:', {
                id: existingOrder.id,
                blingId: existingOrder.blingId,
                numero: existingOrder.numero
            });
            if (transaction && !transaction.finished) {
                await transaction.commit();
            }
            return existingOrder;
        }

        console.log('No existing order found, creating new order...');

        // Handle contact
        let contactId = null;
        if (orderData.contato?.id) {
            const existingContact = await Contact.findOne({ 
                where: { blingId: orderData.contato.id },
                transaction 
            });

            if (existingContact) {
                contactId = existingContact.id;
                console.log(`Using existing contact: ${existingContact.nome}`);
            } else {
                const contactDetails = await getContactById(orderData.contato.id);
                const contact = await Contact.create({
                    blingId: contactDetails.id,
                    nome: contactDetails.nome,
                    codigo: contactDetails.codigo,
                    situacao: contactDetails.situacao,
                    numeroDocumento: contactDetails.numeroDocumento,
                    telefone: contactDetails.telefone,
                    celular: contactDetails.celular,
                    fantasia: contactDetails.fantasia,
                    tipo: contactDetails.tipo,
                    indicadorIe: contactDetails.indicadorIe,
                    ie: contactDetails.ie,
                    rg: contactDetails.rg,
                    orgaoEmissor: contactDetails.orgaoEmissor,
                    email: contactDetails.email,
                    endereco: contactDetails.endereco?.geral?.endereco,
                    cep: contactDetails.endereco?.geral?.cep,
                    bairro: contactDetails.endereco?.geral?.bairro,
                    municipio: contactDetails.endereco?.geral?.municipio,
                    uf: contactDetails.endereco?.geral?.uf,
                    numero: contactDetails.endereco?.geral?.numero,
                    complemento: contactDetails.endereco?.geral?.complemento
                }, { transaction });
                contactId = contact.id;
            }
        }

        // Create new order
        const order = await Order.create({
            blingId: orderData.id,
            numero: orderData.numero,
            numeroLoja: orderData.numeroLoja,
            data: orderData.data,
            dataSaida: orderData.dataSaida,
            dataPrevista: orderData.dataPrevista,
            totalProdutos: orderData.totalProdutos,
            total: orderData.total,
            contatoId: orderData.contato?.id,
            contatoNome: orderData.contato?.nome,
            contatoTipoPessoa: orderData.contato?.tipoPessoa,
            contatoDocumento: orderData.contato?.numeroDocumento,
            situacaoId: orderData.situacao?.id,
            situacaoValor: orderData.situacao?.valor,
            lojaId: orderData.loja?.id,
            numeroPedidoCompra: orderData.numeroPedidoCompra,
            outrasDespesas: orderData.outrasDespesas,
            observacoes: orderData.observacoes,
            observacoesInternas: orderData.observacoesInternas,
            descontoValor: orderData.desconto?.valor,
            descontoUnidade: orderData.desconto?.unidade,
            categoriaId: orderData.categoria?.id,
            notaFiscalId: orderData.notaFiscal?.id,
            tributacaoTotalICMS: orderData.tributacao?.totalICMS,
            tributacaoTotalIPI: orderData.tributacao?.totalIPI,
            freteTransporte: orderData.transporte?.frete,
            volumesTransporte: orderData.transporte?.quantidadeVolumes,
            pesoBrutoTransporte: orderData.transporte?.pesoBruto,
            prazoEntregaTransporte: orderData.transporte?.prazoEntrega,
            vendedorId: orderData.vendedor?.id,
            intermediadorCNPJ: orderData.intermediador?.cnpj,
            intermediadorUsuario: orderData.intermediador?.nomeUsuario,
            taxaComissao: orderData.taxas?.taxaComissao,
            custoFrete: orderData.taxas?.custoFrete,
            valorBase: orderData.taxas?.valorBase,
            contactId: contactId  // Use the contact ID from our database
        }, { transaction });

        // Save items with product type from API
        if (orderData.itens && orderData.itens.length > 0) {
            console.log(`\nSaving ${orderData.itens.length} items...`);
            
            // Fetch and process items sequentially to avoid API rate limits
            const items = [];
            for (const item of orderData.itens) {
                try {
                    console.log(`Fetching product details for item ${item.codigo}...`);
                    const productDetails = await getProductById(item.produto.id);
                    
                    items.push({
                        orderId: order.id,
                        blingId: item.id,
                        tipo: productDetails.tipo,
                        codigo: item.codigo,
                        unidade: item.unidade,
                        quantidade: item.quantidade,
                        desconto: item.desconto,
                        valor: item.valor,
                        aliquotaIPI: item.aliquotaIPI,
                        descricao: item.descricao,
                        descricaoDetalhada: item.descricaoDetalhada,
                        produtoId: item.produto?.id,
                        comissaoBase: item.comissao?.base,
                        comissaoAliquota: item.comissao?.aliquota,
                        comissaoValor: item.comissao?.valor
                    });
                    
                    console.log(`Product type for ${item.codigo}: ${productDetails.tipo}`);
                } catch (error) {
                    console.warn(`Warning: Could not fetch product details for ${item.codigo}. Using default type 'P'.`, error.message);
                    items.push({
                        // ... same as above but with default type
                        orderId: order.id,
                        blingId: item.id,
                        tipo: 'P', // Default type if API call fails
                        // ... rest of the item properties
                        codigo: item.codigo,
                        unidade: item.unidade,
                        quantidade: item.quantidade,
                        desconto: item.desconto,
                        valor: item.valor,
                        aliquotaIPI: item.aliquotaIPI,
                        descricao: item.descricao,
                        descricaoDetalhada: item.descricaoDetalhada,
                        produtoId: item.produto?.id,
                        comissaoBase: item.comissao?.base,
                        comissaoAliquota: item.comissao?.aliquota,
                        comissaoValor: item.comissao?.valor
                    });
                }
            }

            await OrderItem.bulkCreate(items, { transaction });
            console.log('Items saved successfully');
        }

        // Save installments
        if (orderData.parcelas && orderData.parcelas.length > 0) {
            console.log(`\nSaving ${orderData.parcelas.length} installments...`);
            const installments = orderData.parcelas.map(parcela => ({
                orderId: order.id,
                blingId: parcela.id,
                dataVencimento: parcela.dataVencimento,
                valor: parcela.valor,
                observacoes: parcela.observacoes,
                formaPagamentoId: parcela.formaPagamento?.id
            }));
            await OrderInstallment.bulkCreate(installments, { transaction });
            console.log('Installments saved successfully');
        }

        await transaction.commit();
        console.log('New order created successfully:', {
            id: order.id,
            blingId: order.blingId,
            numero: order.numero
        });
        return order;
    } catch (error) {
        console.error('Error in saveOrder:', error);
        if (transaction && !transaction.finished) {
            await transaction.rollback();
        }
        throw error;
    }
}

export async function getOrderItems(orderId) {
    try {
        console.log('\nFetching order items...');
        const items = await OrderItem.findAll({
            where: { orderId },
            include: [{
                model: Order,
                attributes: ['numero', 'blingId']
            }]
        });

        if (!items || items.length === 0) {
            console.log('No items found for order:', orderId);
            return [];
        }

        console.log(`Found ${items.length} items for order ${items[0].Order.numero}`);
        return items;
    } catch (error) {
        console.error('Error fetching order items:', error);
        throw new Error(`Failed to fetch order items: ${error.message}`);
    }
}
