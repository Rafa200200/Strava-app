const express = require('express');
const axios = require('axios');
const polyline = require('@mapbox/polyline');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();
const { spawn } = require('child_process');

const STRAVA_CLIENT_ID = '124322';
const STRAVA_CLIENT_SECRET = '52fb6a823b68da8bd2ac58434e1b0fad86ffb92e';

router.get('/callback', async (req, res) => {
    const code = req.query.code;
    try {
        const response = await axios.post('https://www.strava.com/oauth/token', null, {
            params: {
                client_id: STRAVA_CLIENT_ID,
                client_secret: STRAVA_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code'
            }
        });

        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        const athleteId = response.data.athlete.id;

        const token = req.query.state;
        const decoded = jwt.verify(token, 'your_jwt_private_key');
        const user = await User.findById(decoded._id);

        if (!user) {
            return res.status(404).send({ message: 'Usuário não encontrado.' });
        }

        user.strava = { accessToken, refreshToken, athleteId };
        await user.save();

        res.redirect(`/dashboard.html?token=${token}`);
    } catch (error) {
        console.error('Erro ao conectar ao Strava:', error.response ? error.response.data : error.message);
        res.status(500).send({ message: 'Erro ao conectar ao Strava.', error: error.response ? error.response.data : error.message });
    }
});

router.get('/connect', (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(401).send({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    const clientId = STRAVA_CLIENT_ID;
    const redirectUri = 'http://localhost:3000/api/strava/callback';
    const responseType = 'code';
    const scope = 'activity:read_all';
    const state = token;

    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;
    res.redirect(authUrl);
});

router.get('/activities', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.strava || !user.strava.accessToken) {
            return res.status(400).send({ message: 'Usuário não está conectado ao Strava.' });
        }

        const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
            headers: {
                Authorization: `Bearer ${user.strava.accessToken}`
            }
        });

        const activities = response.data;

        const detailedActivities = await Promise.all(activities.map(async (activity) => {
            const activityDetail = await axios.get(`https://www.strava.com/api/v3/activities/${activity.id}`, {
                headers: {
                    Authorization: `Bearer ${user.strava.accessToken}`
                }
            });

            const polylineData = activityDetail.data.map.summary_polyline;
            const coordinates = polylineData ? polyline.decode(polylineData) : [];
            return {
                id: activity.id,
                name: activity.name,
                coordinates: coordinates,
            };
        }));

        // Inicializar user.activities se estiver undefined
        if (!user.activities) {
            user.activities = [];
        }

        // Verificar se há novas atividades
        const newActivities = detailedActivities.filter(activity => {
            return !user.activities.some(existingActivity => existingActivity.id === activity.id);
        });

        if (newActivities.length === 0) {
            return res.send({ message: 'Sem novas atividades' });
        }

        user.activities = user.activities.concat(newActivities);
        await user.save();

        // Usar spawn em vez de exec
        const child = spawn('node', ['scripts/reverseGeocoding.js']);

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        child.on('close', (code) => {
            if (code !== 0) {
                console.error(`Processo filho saiu com o código ${code}`);
            } else {
                console.log('Script de reverse geocoding executado com sucesso');
                res.send({ message: 'Script finalizado' });
            }
        });

    } catch (error) {
        console.error('Erro ao obter atividades do Strava:', error);
        res.status(500).send({ message: 'Erro ao obter atividades do Strava.', error });
    }
});

router.get('/activities/data', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ message: 'Usuário não encontrado.' });
        }

        res.json(user.activities);
    } catch (error) {
        console.error('Erro ao obter dados de atividades:', error);
        res.status(500).send({ message: 'Erro ao obter dados de atividades.', error });
    }
});

module.exports = router;
