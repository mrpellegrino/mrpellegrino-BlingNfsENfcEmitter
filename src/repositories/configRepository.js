import { sequelize, Config } from '../config/database.js';
import { Order, OrderItem, OrderInstallment, SystemConfig } from '../models/index.js';

async function initializeDatabase() {
    try {
        const hasTable = await sequelize.getQueryInterface().showAllTables();
        if (hasTable.length === 0) {
            await sequelize.sync({ force: true });
        } else {
            await sequelize.sync({ alter: false });
        }
        console.log('Database synchronized successfully');
    } catch (error) {
        console.error('Error synchronizing database:', error);
        throw error;
    }
}

async function saveConfig(clientId, secretKey, accessCode) {
    await Config.upsert({ id: 1, clientId, secretKey, accessCode });
}

async function getConfig() {
    const config = await Config.findByPk(1);
    return config ? config.toJSON() : null;
}

async function saveTokens(accessToken, refreshToken, expiresAt) {
    await Config.update(
        { accessToken, refreshToken, expiresAt }, 
        { where: { id: 1 } }
    );
}

async function getTokens() {
    const config = await Config.findByPk(1);
    return config ? {
        accessToken: config.accessToken,
        refreshToken: config.refreshToken,
        expiresAt: config.expiresAt
    } : null;
}

async function saveInitialOrderNumber(number) {
    await Config.update({ initialOrderNumber: number }, { where: { id: 1 } });
}

export async function truncateDatabase() {
    const transaction = await sequelize.transaction();
    try {
        await Order.destroy({ truncate: { cascade: true }, transaction });
        await OrderItem.destroy({ truncate: { cascade: true }, transaction });
        await OrderInstallment.destroy({ truncate: { cascade: true }, transaction });
        await transaction.commit();
        console.log('Database tables truncated successfully');
    } catch (error) {
        await transaction.rollback();
        throw new Error(`Failed to truncate database: ${error.message}`);
    }
}

export async function getServiceCode() {
    try {
        const config = await SystemConfig.findOne({
            where: { key: 'default_service_code' }
        });
        return config?.value || '5.08';
    } catch (error) {
        console.error('Error getting service code:', error);
        return '5.08';
    }
}

export async function setServiceCode(code) {
    try {
        const [config] = await SystemConfig.findOrCreate({
            where: { key: 'default_service_code' },
            defaults: {
                value: code,
                description: 'Default service code for NFSe generation'
            }
        });

        if (config.value !== code) {
            config.value = code;
            await config.save();
        }

        return config;
    } catch (error) {
        console.error('Error setting service code:', error);
        throw error;
    }
}

export {
    saveConfig,
    getConfig,
    saveTokens,
    getTokens,
    initializeDatabase,
    saveInitialOrderNumber
};
