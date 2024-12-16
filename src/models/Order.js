import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';

const Order = sequelize.define('Order', {
    blingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    numero: {
        type: DataTypes.STRING,
        allowNull: false
    },
    numeroLoja: DataTypes.STRING,
    data: DataTypes.DATE,
    dataSaida: DataTypes.DATE,
    dataPrevista: DataTypes.DATE,
    totalProdutos: DataTypes.DECIMAL(10, 2),
    total: DataTypes.DECIMAL(10, 2),
    contactId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'contacts',
            key: 'id'
        }
    },
    contatoNome: DataTypes.STRING,
    contatoTipoPessoa: DataTypes.STRING(1),
    contatoDocumento: DataTypes.STRING,
    situacaoId: DataTypes.INTEGER,
    situacaoValor: DataTypes.INTEGER,
    lojaId: DataTypes.INTEGER,
    numeroPedidoCompra: DataTypes.STRING,
    outrasDespesas: DataTypes.DECIMAL(10, 2),
    observacoes: DataTypes.TEXT,
    observacoesInternas: DataTypes.TEXT,
    descontoValor: DataTypes.DECIMAL(10, 2),
    descontoUnidade: DataTypes.STRING,
    categoriaId: DataTypes.INTEGER,
    notaFiscalId: DataTypes.INTEGER,
    tributacaoTotalICMS: DataTypes.DECIMAL(10, 2),
    tributacaoTotalIPI: DataTypes.DECIMAL(10, 2),
    freteTransporte: DataTypes.DECIMAL(10, 2),
    volumesTransporte: DataTypes.INTEGER,
    pesoBrutoTransporte: DataTypes.DECIMAL(10, 3),
    prazoEntregaTransporte: DataTypes.INTEGER,
    vendedorId: DataTypes.INTEGER,
    intermediadorCNPJ: DataTypes.STRING,
    intermediadorUsuario: DataTypes.STRING,
    taxaComissao: DataTypes.DECIMAL(10, 2),
    custoFrete: DataTypes.DECIMAL(10, 2),
    valorBase: DataTypes.DECIMAL(10, 2)
}, {
    tableName: 'orders',
    timestamps: true
});

export default Order;
