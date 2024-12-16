import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.db'
});

const Config = sequelize.define('Config', {
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
    }
}, {
    tableName: 'credentials',
    timestamps: false
});



async function saveConfig(clientId, secretKey, accessCode) {
    await initializeDatabase();
    await Config.upsert({ id: 1, clientId, secretKey, accessCode });
}

async function getConfig() {
    await initializeDatabase();
    const config = await Config.findByPk(1);
    return config ? config.toJSON() : null;
}

async function saveTokens(accessToken, refreshToken) {
    await initializeDatabase();
    await Config.update({ accessToken, refreshToken }, { where: { id: 1 } });
}

async function getTokens() {
    await initializeDatabase();
    const config = await Config.findByPk(1);
    return config ? { accessToken: config.accessToken, refreshToken: config.refreshToken } : null;
}

export { saveConfig, getConfig, saveTokens, getTokens, initializeDatabase };
