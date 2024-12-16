import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';
import Order from './Order.js';

const OrderInstallment = sequelize.define('OrderInstallment', {
    blingId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dataVencimento: DataTypes.DATE,
    valor: DataTypes.DECIMAL(10, 2),
    observacoes: DataTypes.TEXT,
    formaPagamentoId: DataTypes.INTEGER
}, {
    tableName: 'order_installments',
    timestamps: true
});

OrderInstallment.belongsTo(Order, { foreignKey: 'orderId' });
Order.hasMany(OrderInstallment, { foreignKey: 'orderId' });

export default OrderInstallment;
