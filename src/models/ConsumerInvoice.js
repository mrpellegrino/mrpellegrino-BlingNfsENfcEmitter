import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ConsumerInvoice = sequelize.define('ConsumerInvoice', {
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
    tableName: 'consumer_invoices'
});

export default ConsumerInvoice;
