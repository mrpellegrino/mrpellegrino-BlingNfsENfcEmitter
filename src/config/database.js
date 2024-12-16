import { Sequelize, DataTypes } from 'sequelize';
import { createContactsTable } from '../migrations/contact.js';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: console.log
});

const Config = sequelize.define('Config', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    clientId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    secretKey: {
        type: DataTypes.STRING,
        allowNull: false
    },
    accessCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    accessToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    initialOrderNumber: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'credentials',
    timestamps: false
});

async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Create tables
        await sequelize.sync({ force: false });
        console.log('Database tables synchronized');
        
        // Run migrations for additional tables
        await createContactsTable();
        
        // Check if default config exists
        const defaultConfig = await Config.findOne({ where: { id: 1 } });
        if (!defaultConfig) {
            await Config.create({
                id: 1,
                clientId: '',
                secretKey: '',
                accessCode: '',
                accessToken: null,
                refreshToken: null,
                initialOrderNumber: null
            });
            console.log('Default configuration created');
        }
        
        return true;
    } catch (error) {
        console.error('Unable to initialize database:', error);
        throw error;
    }
}

export { sequelize, Config, initializeDatabase };