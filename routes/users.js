const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Rota para registrar um novo usuário
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        console.log('Nome de usuário e senha são obrigatórios');
        return res.status(400).send({ message: 'Nome de usuário e senha são obrigatórios.' });
    }
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Nome de usuário já existe');
            return res.status(400).send({ message: 'Nome de usuário já existe. Por favor, escolha outro.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });

        await user.save();

        const token = jwt.sign({ _id: user._id }, 'your_jwt_private_key');
        res.header('x-auth-token', token).status(201).send({ message: 'Utilizador registado com sucesso!' });
    } catch (error) {
        console.log('Erro ao registar utilizador:', error);
        res.status(400).send({ message: 'Erro ao registar utilizador.', error });
    }
});

// Rota para login de usuário
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        console.log('Nome de usuário e senha são obrigatórios');
        return res.status(400).send({ message: 'Nome de usuário e senha são obrigatórios.' });
    }
    try {
        const user = await User.findOne({ username });
        if (!user || !await bcrypt.compare(password, user.password)) {
            console.log('Credenciais inválidas');
            return res.status(400).send({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ _id: user._id }, 'your_jwt_private_key');
        res.header('x-auth-token', token).send({ message: 'Login efetuado com sucesso!' });
    } catch (error) {
        console.log('Erro no servidor:', error);
        res.status(500).send({ message: 'Erro no servidor.', error });
    }
});

module.exports = router;
