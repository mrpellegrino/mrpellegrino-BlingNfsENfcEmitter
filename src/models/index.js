import { sequelize } from '../config/database.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import OrderInstallment from './OrderInstallment.js';
import ServiceInvoice from './ServiceInvoice.js';
import ConsumerInvoice from './ConsumerInvoice.js';
import Contact from './Contact.js';

// Remove Contact associations
Order.hasMany(OrderItem, {
    foreignKey: 'orderId',
    as: 'items'
});

Order.hasMany(OrderInstallment, {
    foreignKey: 'orderId',
    as: 'installments'
});

// Add reverse associations
OrderItem.belongsTo(Order, {
    foreignKey: 'orderId'
});

OrderInstallment.belongsTo(Order, {
    foreignKey: 'orderId'
});

// Define associations
Order.belongsTo(Contact, {
    foreignKey: 'contactId',
    as: 'contact'
});

export {
    sequelize,
    Order, 
    OrderItem,
    OrderInstallment,
    ServiceInvoice,
    ConsumerInvoice,
    Contact
};
