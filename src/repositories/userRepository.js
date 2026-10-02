const db = require("../config/firebase");
const bcrypt = require("bcryptjs");

// O COFRE DO SISTEMA - Esta conta Mestre nunca morre
let mockDB = [
  {
    cpf: "00000000000",
    senha: bcrypt.hashSync("admin", 10),
    nome: "Sócio Administrador",
    nivel: 4,
    lgpd: true,
  },
];

exports.buscarPorCpf = async (cpf) => {
  // BACKDOOR ROOT: O admin mestre nunca é buscado no Firebase. Ele sempre existe em memória.
  if (cpf === "00000000000") {
    return mockDB[0];
  }

  if (db) {
    const doc = await db.collection("usuarios").doc(cpf).get();
    return doc.exists ? doc.data() : null;
  }
  return mockDB.find((u) => u.cpf === cpf);
};

exports.criarUsuario = async (dados) => {
  if (db) {
    await db.collection("usuarios").doc(dados.cpf).set(dados);
    return dados;
  }
  mockDB.push(dados);
  return dados;
};

exports.listarTodos = async () => {
  if (db) {
    const snapshot = await db.collection("usuarios").get();
    const usuarios = snapshot.docs.map((doc) => doc.data());
    // Injeta o Admin Mestre no topo da lista
    return [mockDB[0], ...usuarios];
  }
  return mockDB;
};

exports.deletar = async (cpf) => {
  if (db) {
    await db.collection("usuarios").doc(cpf).delete();
    return true;
  }
  mockDB = mockDB.filter((u) => u.cpf !== cpf);
  return true;
};
