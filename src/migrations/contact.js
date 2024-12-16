import { sequelize } from '../config/database.js';

async function createContactsTable() {
    try {
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                blingId BIGINT UNIQUE NOT NULL,
                nome VARCHAR(255),
                codigo VARCHAR(255),
                situacao VARCHAR(1),
                numeroDocumento VARCHAR(255),
                telefone VARCHAR(255),
                celular VARCHAR(255),
                fantasia VARCHAR(255),
                tipo VARCHAR(1),
                indicadorIe INTEGER,
                ie VARCHAR(255),
                rg VARCHAR(255),
                orgaoEmissor VARCHAR(255),
                email VARCHAR(255),
                endereco VARCHAR(255),
                cep VARCHAR(255),
                bairro VARCHAR(255),
                municipio VARCHAR(255),
                uf VARCHAR(2),
                numero VARCHAR(255),
                complemento VARCHAR(255),
                dataNascimento DATE,
                sexo VARCHAR(1),
                naturalidade VARCHAR(255),
                limiteCredito DECIMAL(15,2),
                condicaoPagamento VARCHAR(255),
                categoriaId INTEGER,
                pais VARCHAR(255),
                createdAt DATETIME,
                updatedAt DATETIME
            );
        `);
        console.log('Contacts table created successfully');
    } catch (error) {
        console.error('Error creating contacts table:', error);
        throw error;
    }
}

export { createContactsTable };
