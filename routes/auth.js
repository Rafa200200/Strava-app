// Importa o módulo express
const express = require('express');
// Importa o módulo bcrypt para hashing de senhas
const bcrypt = require('bcrypt');
// Importa o módulo jsonwebtoken para manipulação de tokens JWT
const jwt = require('jsonwebtoken');
// Importa o modelo de usuário do banco de dados
const User = require('../models/User');
// Cria um roteador do express
const router = express.Router();

// Rota para registrar um novo usuário
router.post('/register', async (req, res) => {
    const { username, password } = req.body;  // Extrai username e password do corpo da requisição
    if (!username || !password) {  // Verifica se username e password foram fornecidos
        console.log('Nome de usuário e senha são obrigatórios');
        return res.status(400).send({ message: 'Nome de usuário e senha são obrigatórios.' });
    }
    try {
        // Verifica se já existe um usuário com o mesmo nome de usuário
        const existingUser = await User.findOne({ username });
        if (existingUser) {  // Se o usuário já existir, envia uma resposta de erro
            console.log('Nome de usuário já existe');
            return res.status(400).send({ message: 'Nome de usuário já existe. Por favor, escolha outro.' });
        }

        // Hasheia a senha com um custo de 10 rounds
        const hashedPassword = await bcrypt.hash(password, 10);
        // Cria um novo usuário com o username e a senha hasheada
        const user = new User({ username, password: hashedPassword });
        // Salva o novo usuário no banco de dados
        await user.save();

        // Gera um token JWT com o ID do usuário
        const token = jwt.sign({ _id: user._id }, 'your_jwt_private_key');
        // Envia o token no cabeçalho da resposta e uma mensagem de sucesso
        res.header('x-auth-token', token).status(201).send({ message: 'Utilizador registado com sucesso!' });
    } catch (error) {  // Captura e trata erros durante o registro
        console.log('Erro ao registar utilizador:', error);
        res.status(400).send({ message: 'Erro ao registar utilizador.', error });
    }
});

// Rota para login de usuário
router.post('/login', async (req, res) => {
    const { username, password } = req.body;  // Extrai username e password do corpo da requisição
    if (!username || !password) {  // Verifica se username e password foram fornecidos
        console.log('Nome de usuário e senha são obrigatórios');
        return res.status(400).send({ message: 'Nome de usuário e senha são obrigatórios.' });
    }
    try {
        // Busca o usuário no banco de dados pelo username
        const user = await User.findOne({ username });
        // Verifica se o usuário existe e se a senha fornecida corresponde à senha armazenada
        if (!user || !await bcrypt.compare(password, user.password)) {
            console.log('Credenciais inválidas');
            return res.status(400).send({ message: 'Credenciais inválidas.' });
        }

        // Gera um token JWT com o ID do usuário
        const token = jwt.sign({ _id: user._id }, 'your_jwt_private_key');
        // Envia o token no cabeçalho da resposta e uma mensagem de sucesso
        res.header('x-auth-token', token).send({ message: 'Login efetuado com sucesso!' });
    } catch (error) {  // Captura e trata erros durante o login
        console.log('Erro no servidor:', error);
        res.status(500).send({ message: 'Erro no servidor.', error });
    }
});

// Exporta o roteador para uso em outros módulos
module.exports = router;
