import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const SystemConfig = sequelize.define('SystemConfig', {
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'system_configs'
});

export default SystemConfig;
