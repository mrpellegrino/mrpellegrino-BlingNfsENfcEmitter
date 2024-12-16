import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

class ConsumerInvoice extends Model {}

ConsumerInvoice.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: {
        type: DataTypes.STRING
    },
    data: {
        type: DataTypes.DATE
    },
    situacao: {
        type: DataTypes.STRING
    },
    valorTotal: {
        type: DataTypes.DECIMAL(10, 2)
    },
    contatoId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'contacts',
            key: 'id'
        }
    },
    lojaId: {
        type: DataTypes.INTEGER
    }
}, {
    sequelize,
    modelName: 'ConsumerInvoice',
    tableName: 'consumer_invoices',
    timestamps: true
});

export default ConsumerInvoice;
