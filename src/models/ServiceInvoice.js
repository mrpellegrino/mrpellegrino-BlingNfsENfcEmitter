import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Order from './order.js'; // Fix case sensitivity

const ServiceInvoice = sequelize.define('ServiceInvoice', {
    blingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    numero: DataTypes.STRING,
    serie: DataTypes.STRING,
    status: DataTypes.STRING,
    orderId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'orders',
            key: 'id'
        }
    }
}, {
    tableName: 'service_invoices',
    timestamps: true
});

ServiceInvoice.belongsTo(Order, { foreignKey: 'orderId' });
Order.hasMany(ServiceInvoice, { foreignKey: 'orderId' });

export default ServiceInvoice;
