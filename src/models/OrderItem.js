import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';
import Order from './Order.js';

const OrderItem = sequelize.define('OrderItem', {
    blingId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    codigo: DataTypes.STRING,
    unidade: DataTypes.STRING,
    quantidade: DataTypes.DECIMAL(10, 3),
    desconto: DataTypes.DECIMAL(10, 2),
    valor: DataTypes.DECIMAL(10, 2),
    aliquotaIPI: DataTypes.DECIMAL(10, 2),
    descricao: DataTypes.STRING,
    descricaoDetalhada: DataTypes.TEXT,
    produtoId: DataTypes.INTEGER,
    comissaoBase: DataTypes.DECIMAL(10, 2),
    comissaoAliquota: DataTypes.DECIMAL(10, 2),
    comissaoValor: DataTypes.DECIMAL(10, 2)
}, {
    tableName: 'order_items',
    timestamps: true
});

OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });

export default OrderItem;
