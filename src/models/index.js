import { sequelize } from '../config/database.js';
import Order from './order.js';
import OrderItem from './orderItem.js';
import Contact from './contact.js';
import OrderInstallment from './orderInstallment.js';
import ServiceInvoice from './serviceInvoice.js';
import ConsumerInvoice from './consumerInvoice.js';
import SystemConfig from './systemConfig.js';

// Define associations
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Order.hasMany(OrderInstallment, { foreignKey: 'orderId' });
OrderInstallment.belongsTo(Order, { foreignKey: 'orderId' });

Order.hasMany(ServiceInvoice, { foreignKey: 'orderId' });
ServiceInvoice.belongsTo(Order, { foreignKey: 'orderId' });

Order.hasMany(ConsumerInvoice, { foreignKey: 'orderId' });
ConsumerInvoice.belongsTo(Order, { foreignKey: 'orderId' });

Order.belongsTo(Contact, { foreignKey: 'contactId' });
Contact.hasMany(Order, { foreignKey: 'contactId' });

// Export all models
export {
    Order,
    OrderItem,
    Contact,
    OrderInstallment,
    ServiceInvoice,
    ConsumerInvoice,
    SystemConfig,
    sequelize
};
