import { Order, OrderItem, ServiceInvoice, ConsumerInvoice } from '../models/index.js';
import { issueNFCe } from '../services/bling/nfce.js';
import { issueNFSe } from '../services/bling/nfse.js';
import { sequelize } from '../config/database.js';

export async function issueInvoices(orderId) {
    const transaction = await sequelize.transaction();
    try {
        console.log('\nStarting invoice generation process...');
        console.log('Finding order and related data...');
        
        const order = await Order.findOne({
            where: { id: orderId },
            include: [
                { 
                    model: OrderItem,
                    required: false
                }
            ],
            transaction
        });

        if (!order) {
            throw new Error('Order not found');
        }

        console.log(`Found order #${order.numero} with:`);
        console.log(`- ${order.OrderItems?.length || 0} items`);

        if (!order.OrderItems || order.OrderItems.length === 0) {
            throw new Error('No items found for this order');
        }

        const serviceItems = order.OrderItems.filter(item => item.tipo === 'S');
        const productItems = order.OrderItems.filter(item => item.tipo === 'P');

        console.log(`Items breakdown: ${serviceItems.length} services, ${productItems.length} products`);

        // Issue consumer invoice (NFCe) for products
        if (productItems.length > 0) {
            console.log('\nGenerating NFCe for products...');
            try {
                const nfceData = {
                    ...order.toJSON(),
                    OrderItems: productItems
                };
                console.log('NFCe request data:', JSON.stringify(nfceData, null, 2));
                
                const nfceResponse = await issueNFCe(nfceData);
                console.log('NFCe response:', nfceResponse);
                
                await ConsumerInvoice.create({
                    blingId: nfceResponse.id,
                    numero: nfceResponse.numero,
                    serie: nfceResponse.serie,
                    status: nfceResponse.status,
                    orderId: order.id
                }, { transaction });

                console.log('Consumer invoice (NFCe) created successfully');
            } catch (error) {
                console.error('Error generating NFCe:', error);
                throw error;
            }
        }

        // Issue service invoice (NFSe) for services
        if (serviceItems.length > 0) {
            console.log('\nGenerating NFSe for services...');
            try {
                const nfseData = {
                    ...order.toJSON(),
                    OrderItems: serviceItems
                };
                console.log('NFSe request data:', JSON.stringify(nfseData, null, 2));
                
                const nfseResponse = await issueNFSe(nfseData);
                console.log('NFSe response:', nfseResponse);
                
                await ServiceInvoice.create({
                    blingId: nfseResponse.id,
                    numero: nfseResponse.numero,
                    serie: nfseResponse.serie,
                    status: nfseResponse.status,
                    orderId: order.id
                }, { transaction });

                console.log('Service invoice (NFSe) created successfully');
            } catch (error) {
                console.error('Error generating NFSe:', error);
                throw error;
            }
        }

        await transaction.commit();
        console.log('\nAll invoices generated and saved successfully');
        return true;
    } catch (error) {
        console.error('Error in invoice generation process:', error);
        await transaction.rollback();
        throw error;
    }
}
