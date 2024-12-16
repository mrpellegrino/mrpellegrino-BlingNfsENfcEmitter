import { getOrderByCode } from './orders.js';
import { saveOrder } from '../../repositories/orderRepository.js';
import { getConfig } from '../../repositories/configRepository.js';
import { Order } from '../../models/index.js';

const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds
const MAX_CONSECUTIVE_FAILURES = 10;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function syncOrders() {
    try {
        const config = await getConfig();
        const initialOrderNumber = config.initialOrderNumber;
        let currentIndex = 0;
        let consecutiveFailures = 0;

        console.log('\nStarting order synchronization...');
        console.log(`Initial order number: ${initialOrderNumber}`);

        while (consecutiveFailures < MAX_CONSECUTIVE_FAILURES) {
            const orderNumberToSync = initialOrderNumber + currentIndex;

            // First check if order exists in database
            const existingOrder = await Order.findOne({ 
                where: { numero: orderNumberToSync.toString() }
            });

            if (existingOrder) {
                console.log(`Order ${orderNumberToSync} already exists in database, skipping...`);
                currentIndex++;
                continue;
            }

            // If order doesn't exist, wait before making API call
            await delay(DELAY_BETWEEN_REQUESTS);

            try {
                console.log(`\nAttempting to sync order number: ${orderNumberToSync}`);
                const orderData = await getOrderByCode(orderNumberToSync);
                await saveOrder(orderData.data);
                
                console.log('\x1b[32m%s\x1b[0m', `✓ Order ${orderNumberToSync} synchronized successfully`);
                consecutiveFailures = 0;
            } catch (error) {
                if (error.message.includes('not found')) {
                    console.log(`Order number ${orderNumberToSync} not found`);
                    consecutiveFailures++;
                    console.log(`Consecutive failures: ${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}`);
                } else {
                    console.error('\x1b[31m%s\x1b[0m', `Error during synchronization: ${error.message}`);
                    throw error;
                }
            }

            currentIndex++;
        }

        console.log('\n\x1b[32m%s\x1b[0m', 'Synchronization completed successfully!');
        console.log(`No more orders found after ${MAX_CONSECUTIVE_FAILURES} consecutive attempts`);
        console.log(`Last order number checked: ${initialOrderNumber + currentIndex - 1}`);
        
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', 'Fatal error during synchronization:', error);
        throw error;
    }
}

export { syncOrders };
