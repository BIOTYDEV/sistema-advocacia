const db = require('../config/firebase');
const bcrypt = require('bcryptjs');

let mockDB = [
    { cpf: "00000000000", senha: bcrypt.hashSync("admin", 10), nome: "Sócio Administrador", nivel: 4, lgpd: true }
];

exports.buscarPorCpf = async (cpf) => {
    if (db) {
        const doc = await db.collection('usuarios').doc(cpf).get();
        return doc.exists ? doc.data() : null;
    }
    return mockDB.find(u => u.cpf === cpf);
};

exports.criarUsuario = async (dados) => {
    if (db) {
        await db.collection('usuarios').doc(dados.cpf).set(dados);
        return dados;
    }
    mockDB.push(dados); return dados;
};

exports.listarTodos = async () => {
    if (db) {
        const snapshot = await db.collection('usuarios').get();
        return snapshot.docs.map(doc => doc.data());
    }
    return mockDB;
};

exports.deletar = async (cpf) => {
    if (db) {
        await db.collection('usuarios').doc(cpf).delete();
        return true;
    }
    mockDB = mockDB.filter(u => u.cpf !== cpf); return true;
};
