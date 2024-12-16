import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Contact = sequelize.define('Contact', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    blingId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true
    },
    nome: DataTypes.STRING,
    codigo: DataTypes.STRING,
    situacao: DataTypes.STRING(1),
    numeroDocumento: DataTypes.STRING,
    telefone: DataTypes.STRING,
    celular: DataTypes.STRING,
    fantasia: DataTypes.STRING,
    tipo: DataTypes.STRING(1),
    indicadorIe: DataTypes.INTEGER,
    ie: DataTypes.STRING,
    rg: DataTypes.STRING,
    orgaoEmissor: DataTypes.STRING,
    email: DataTypes.STRING,
    // Endereco geral
    endereco: DataTypes.STRING,
    cep: DataTypes.STRING,
    bairro: DataTypes.STRING, 
    municipio: DataTypes.STRING,
    uf: DataTypes.STRING(2),
    numero: DataTypes.STRING,
    complemento: DataTypes.STRING,
    // Dados adicionais
    dataNascimento: DataTypes.DATEONLY,
    sexo: DataTypes.STRING(1),
    naturalidade: DataTypes.STRING,
    // Financeiro
    limiteCredito: DataTypes.DECIMAL(15,2),
    condicaoPagamento: DataTypes.STRING,
    categoriaId: DataTypes.INTEGER,
    // País
    pais: DataTypes.STRING
}, {
    tableName: 'contacts'
});

export default Contact;

