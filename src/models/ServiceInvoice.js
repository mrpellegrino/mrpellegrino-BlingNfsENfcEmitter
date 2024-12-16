import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';
import Order from './Order.js';

const ServiceInvoice = sequelize.define('ServiceInvoice', {
    blingId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    numero: DataTypes.STRING,
    serie: DataTypes.STRING,
    status: DataTypes.STRING,
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'service_invoices',
    timestamps: true
});

ServiceInvoice.belongsTo(Order, { foreignKey: 'orderId' });
Order.hasMany(ServiceInvoice, { foreignKey: 'orderId' });

export default ServiceInvoice;
