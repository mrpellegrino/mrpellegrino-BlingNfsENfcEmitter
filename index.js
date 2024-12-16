import readline from 'readline';
import { saveConfig, initializeDatabase, getConfig, saveInitialOrderNumber, truncateDatabase } from './src/repositories/configRepository.js';
import { getToken } from './src/services/bling/auth.js';
import { getOrderByCode } from './src/services/bling/orders.js';
import { getContactById } from './src/services/bling/contacts.js';
import { saveOrder, getOrderItems } from './src/repositories/orderRepository.js';
import { issueInvoices } from './src/repositories/invoiceRepository.js';
import { syncOrders } from './src/services/bling/syncOrders.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showMenu() {
    console.log(`
    Selecione uma opção:
    1. Configurações
    2. Save Sales Order
    3. Issue Invoices
    4. Exit
    5. Get Order Items
    8. Fetch Single Order
    9. Fetch Contacts
    10. Sync Orders
    `);
}

async function startMenu() {
    while (true) {
        showMenu();
        const option = await new Promise((resolve) => {
            rl.question('Enter your choice: ', (answer) => {
                resolve(answer.trim());
            });
        });

        switch (option) {
            case '1':
                await showConfigMenu();
                break;
            case '2':
                await new Promise((resolve) => {
                    rl.question('Enter order number to save: ', async (orderCode) => {
                        if (!orderCode.trim()) {
                            console.log('Operation cancelled');
                        } else {
                            try {
                                const orderData = await getOrderByCode(orderCode.trim());
                                await saveOrder(orderData.data);
                                console.log('\x1b[32m%s\x1b[0m', 'Order saved successfully to database');
                            } catch (error) {
                                console.log('\x1b[31m%s\x1b[0m', `Error: ${error.message}`);
                            }
                        }
                        resolve();
                    });
                });
                break;
            case '3':
                await new Promise((resolve) => {
                    rl.question('Enter order ID to issue invoices: ', async (orderId) => {
                        if (!orderId.trim()) {
                            console.log('Operation cancelled');
                        } else {
                            try {
                                await issueInvoices(parseInt(orderId));
                                console.log('\x1b[32m%s\x1b[0m', 'Invoices issued successfully');
                            } catch (error) {
                                console.log('\x1b[31m%s\x1b[0m', `Error issuing invoices: ${error.message}`);
                            }
                        }
                        resolve();
                    });
                });
                break;
            case '4':
                console.log('Exiting...');
                rl.close();
                return;
            case '5':
                await new Promise((resolve) => {
                    rl.question('Enter order ID to get items: ', async (orderId) => {
                        if (!orderId.trim()) {
                            console.log('Operation cancelled');
                        } else {
                            try {
                                const items = await getOrderItems(parseInt(orderId));
                                console.log('\nOrder Items:', JSON.stringify(items, null, 2));
                                console.log('\x1b[32m%s\x1b[0m', `Found ${items.length} items`);
                            } catch (error) {
                                console.log('\x1b[31m%s\x1b[0m', `Error: ${error.message}`);
                            }
                        }
                        resolve();
                    });
                });
                break;
            case '8':
                await new Promise((resolve) => {
                    rl.question('Enter order code: ', async (orderCode) => {
                        if (!orderCode.trim()) {
                            console.log('Operation cancelled');
                        } else {
                            try {
                                await getOrderByCode(orderCode.trim());
                                console.log('Order fetched successfully');
                            } catch (error) {
                                console.log('\x1b[31m%s\x1b[0m', `Error: ${error.message}`);
                            }
                        }
                        resolve();
                    });
                });
                break;
           
                case '9':
                    await new Promise((resolve) => {
                        rl.question('Enter Contact code: ', async (contactCode) => {
                            if (!contactCode.trim()) {
                                console.log('Operation cancelled');
                            } else {
                                try {
                                    await getContactById(contactCode.trim());
                                    console.log('Contact fetched successfully');
                                } catch (error) {
                                    console.log('\x1b[31m%s\x1b[0m', `Error: ${error.message}`);
                                }
                            }
                            resolve();
                        });
                    });
                    break;
                case '10':
                    try {
                        await syncOrders();
                    } catch (error) {
                        console.log('\x1b[31m%s\x1b[0m', `Error during synchronization: ${error.message}`);
                    }
                    break;
                default:
                console.log('Invalid option, please try again.');
        }
    }
}

async function showConfigMenu() {
    console.log(`
    Configurações - Selecione uma opção:
    1. Save Credentials
    2. Create Connection
    5. Show Credentials
    6. Truncate Database
    7. Set Initial Order Number
    0. Voltar ao menu principal
    `);

    const option = await new Promise((resolve) => {
        rl.question('Enter your choice: ', (answer) => {
            resolve(answer.trim());
        });
    });

    switch (option) {
        case '1':
            rl.question('Enter Client ID: ', (clientId) => {
                rl.question('Enter Secret Key: ', (secretKey) => {
                    rl.question('Enter Access Code: ', async (accessCode) => {
                        await saveConfig(clientId, secretKey, accessCode);
                        console.log('Credentials and Access Code saved.');
                    });
                });
            });
            break;
        case '2':
            console.log('Creating Connection...');
            await getToken();
            console.log('Connection created.');
            break;
        case '5':
            const config = await getConfig();
            console.log('Credentials:', config);
            break;
        case '6':
            await new Promise((resolve) => {
                rl.question('Are you sure you want to truncate the database? (y/N): ', async (answer) => {
                    if (answer.toLowerCase() === 'y') {
                        try {
                            await truncateDatabase();
                            console.log('\x1b[32m%s\x1b[0m', 'Database truncated successfully');
                        } catch (error) {
                            console.log('\x1b[31m%s\x1b[0m', `Error truncating database: ${error.message}`);
                        }
                    } else {
                        console.log('Operation cancelled');
                    }
                    resolve();
                });
            });
            break;
        case '7':
            await new Promise((resolve) => {
                getConfig().then(config => {
                    console.log('Current initial order number:', config.initialOrderNumber || 'Not set');
                    rl.question('Enter new initial order number (or press Enter to cancel): ', async (number) => {
                        if (!number.trim()) {
                            console.log('Operation cancelled');
                            resolve();
                            return;
                        }
                        const orderNumber = parseInt(number);
                        if (isNaN(orderNumber)) {
                            console.log('Please enter a valid number');
                        } else {
                            await saveInitialOrderNumber(orderNumber);
                            console.log(`Initial order number set to: ${orderNumber}`);
                        }
                        resolve();
                    });
                });
            });
            break;
        case '0':
            // Retorna ao menu principal
            return;
        default:
            console.log('Opção inválida, tente novamente.');
            await showConfigMenu();
    }
}

async function startApp() {
    await initializeDatabase();
    await startMenu();
}

startApp();
