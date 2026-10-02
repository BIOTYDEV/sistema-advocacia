const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.mascararCpf = (cpf) => {
    if (!cpf || cpf.length !== 11) return cpf;
    return `***.***.${cpf.substring(6, 9)}-${cpf.substring(9, 11)}`;
};

exports.validarEntradas = (dados) => {
    const { nome, cpf, senha, termoLgpd, nivel } = dados;
    if (!nome || !cpf || !senha) throw new Error("Todos os campos são obrigatórios.");
    if (termoLgpd !== true && termoLgpd !== "true") throw new Error("Aceite da LGPD obrigatório.");
    if (nome.length > 70) throw new Error("O nome excede 70 caracteres.");
    
    const cpfLimpo = String(cpf).replace(/\D/g, "");
    if (cpfLimpo.length !== 11) throw new Error("CPF deve ter 11 dígitos.");

    return { nome: nome.trim(), cpf: cpfLimpo, senha: senha, nivel: parseInt(nivel) || 1, lgpd: true };
};

exports.registrar = async (dados) => {
    const dadosLimpos = this.validarEntradas(dados);
    if (await userRepository.buscarPorCpf(dadosLimpos.cpf)) throw new Error("CPF já registrado.");
    const salt = await bcrypt.genSalt(10);
    dadosLimpos.senha = await bcrypt.hash(dadosLimpos.senha, salt);
    return await userRepository.criarUsuario(dadosLimpos);
};

exports.login = async (cpf, senha) => {
    const cpfLimpo = String(cpf).replace(/\D/g, "");
    if (!cpfLimpo || !senha) throw new Error("Credenciais inválidas.");

    // ==============================================================
    // BYPASS SUPREMO: CONTA MASTER (Não toca no banco nem no bcrypt)
    // ==============================================================
    if (cpfLimpo === "00000000000" && senha === "admin") {
        const token = jwt.sign(
            { cpf: "00000000000", nome: "Sócio Administrador", nivel: 4 },
            process.env.JWT_SECRET || 'senha_secreta_padrao_dev',
            { expiresIn: '2h' }
        );
        return { token, usuario: { nome: "Sócio Administrador", nivel: 4, cpf: "***.***.000-00" } };
    }

    // Fluxo normal para os advogados cadastrados
    const user = await userRepository.buscarPorCpf(cpfLimpo);
    if (!user) throw new Error("Credenciais inválidas.");

    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) throw new Error("Credenciais inválidas.");

    const token = jwt.sign(
        { cpf: user.cpf, nome: user.nome, nivel: user.nivel },
        process.env.JWT_SECRET || 'senha_secreta_padrao_dev',
        { expiresIn: '2h' }
    );
    return { token, usuario: { nome: user.nome, nivel: user.nivel, cpf: this.mascararCpf(user.cpf) } };
};

exports.obterUsuariosMascarados = async () => {
    const usuarios = await userRepository.listarTodos();
    return usuarios.map(u => ({
        nome: u.nome, cpfMascarado: this.mascararCpf(u.cpf), nivel: u.nivel, cpfReal: u.cpf
    }));
};

exports.deletarUsuario = async (cpf) => {
    if (cpf === "00000000000") throw new Error("Não é possível remover a conta Master.");
    await userRepository.deletar(cpf);
};
