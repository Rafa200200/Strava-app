// tests/server.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');

const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

beforeAll(async () => {
    const url = 'mongodb://localhost:27017/test_strava-app';
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
    await User.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('User Registration and Login', () => {
    it('should register a user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Utilizador registado com sucesso!');

        const user = await User.findOne({ username: 'testuser' });
        expect(user).not.toBeNull();
        expect(await bcrypt.compare('testpassword', user.password)).toBe(true);
    });

    it('should not register a user with duplicate username', async () => {
        const hashedPassword = await bcrypt.hash('testpassword', 10);
        const user = new User({ username: 'testuser', password: hashedPassword });
        await user.save();

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Nome de usuário já existe. Por favor, escolha outro.');
    });

    it('should login a user', async () => {
        const hashedPassword = await bcrypt.hash('testpassword', 10);
        const user = new User({ username: 'testuser', password: hashedPassword });
        await user.save();

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login efetuado com sucesso!');
        expect(response.header).toHaveProperty('x-auth-token');
    });

    it('should not login with incorrect password', async () => {
        const hashedPassword = await bcrypt.hash('testpassword', 10);
        const user = new User({ username: 'testuser', password: hashedPassword });
        await user.save();

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'wrongpassword'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Credenciais inválidas.');
    });
});

describe('Profile Update and Password Recovery', () => {
    it('should update user profile', async () => {
        const hashedPassword = await bcrypt.hash('testpassword', 10);
        const user = new User({ username: 'testuser', password: hashedPassword });
        await user.save();

        const token = jwt.sign({ _id: user._id }, 'your_jwt_private_key');

        const response = await request(app)
            .put('/api/users/update')
            .set('x-auth-token', token)
            .send({
                username: 'updateduser',
                password: 'newpassword'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Perfil atualizado com sucesso!');

        const updatedUser = await User.findById(user._id);
        expect(updatedUser.username).toBe('updateduser');
        expect(await bcrypt.compare('newpassword', updatedUser.password)).toBe(true);
    });

    it('should recover password', async () => {
        const hashedPassword = await bcrypt.hash('testpassword', 10);
        const user = new User({ username: 'testuser', password: hashedPassword });
        await user.save();

        const response = await request(app)
            .post('/api/users/forgot-password')
            .send({
                username: 'testuser',
                newPassword: 'newpassword'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Senha atualizada com sucesso!');

        const updatedUser = await User.findOne({ username: 'testuser' });
        expect(await bcrypt.compare('newpassword', updatedUser.password)).toBe(true);
    });
});
