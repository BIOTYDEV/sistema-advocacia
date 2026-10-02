const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authController = require('./controllers/authController');
const { verificarToken, apenasDiretor } = require('./middlewares/authMiddleware');

const app = express();

app.use(helmet()); 
app.use(cors());
app.use(express.json({ limit: '10kb' })); 
app.use(express.static(path.join(__dirname, '../public')));

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 10,
    message: { erro: "Acesso bloqueado temporariamente por excesso de tentativas." }
});

app.post('/api/login', limiter, authController.login);
app.post('/api/cadastrar', verificarToken, apenasDiretor, authController.cadastrar);
app.get('/api/usuarios', verificarToken, apenasDiretor, authController.listarUsuarios);
app.delete('/api/usuarios/:cpf', verificarToken, apenasDiretor, authController.deletarUsuario);

app.use((err, req, res, next) => {
    console.error("[LOG DEV]", err.message);
    res.status(500).json({ erro: "Erro interno no servidor." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

module.exports = app;
