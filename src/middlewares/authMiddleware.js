const jwt = require('jsonwebtoken');

exports.verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ erro: "Acesso negado. Token ausente." });

    jwt.verify(token, process.env.JWT_SECRET || 'senha_secreta_padrao_dev', (err, decoded) => {
        if (err) return res.status(401).json({ erro: "Token inválido ou expirado." });
        req.usuario = decoded;
        next();
    });
};

exports.apenasDiretor = (req, res, next) => {
    if (req.usuario.nivel !== 4) return res.status(403).json({ erro: "Ação restrita à Diretoria." });
    next();
};
