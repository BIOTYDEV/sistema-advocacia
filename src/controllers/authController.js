const authService = require('../services/authService');

exports.cadastrar = async (req, res) => {
    try { await authService.registrar(req.body); res.status(201).json({ mensagem: 'Agente habilitado.' }); } 
    catch (error) { res.status(400).json({ erro: error.message }); }
};

exports.login = async (req, res) => {
    try { res.status(200).json(await authService.login(req.body.cpf, req.body.senha)); } 
    catch (error) { res.status(401).json({ erro: error.message }); }
};

exports.listarUsuarios = async (req, res) => {
    try { res.status(200).json(await authService.obterUsuariosMascarados()); } 
    catch (error) { res.status(500).json({ erro: "Erro ao buscar equipe." }); }
};

exports.deletarUsuario = async (req, res) => {
    try { await authService.deletarUsuario(req.params.cpf); res.status(200).json({ mensagem: "Acesso revogado." }); } 
    catch (error) { res.status(400).json({ erro: error.message }); }
};
