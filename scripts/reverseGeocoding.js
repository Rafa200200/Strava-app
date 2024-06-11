const mongoose = require('mongoose');
const User = require('../models/User');
const nominatim = require('nominatim-client');
const pLimit = require('p-limit'); // Biblioteca para limitar chamadas concorrentes
const NodeCache = require('node-cache'); // Biblioteca de cache em memória

// Conecte-se ao MongoDB
mongoose.connect('mongodb://localhost:27017/strava-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

// Configurar cliente Nominatim
const client = nominatim.createClient({
    useragent: "myApp",
    referer: "http://localhost:3000"
});

const cache = new NodeCache({ stdTTL: 86400 }); // Cache com TTL de 1 dia
const limit = pLimit(5); // Limitar a 5 chamadas concorrentes

async function reverseGeocode(lat, lon) {
    const cacheKey = `${lat},${lon}`;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    try {
        console.log(`Reverse geocoding for lat: ${lat}, lon: ${lon}`);
        const response = await client.reverse({
            lat: lat,
            lon: lon,
            zoom: 10,
            addressdetails: true
        });
        console.log('Reverse geocode response:', response);
        const address = response.address;
        cache.set(cacheKey, address);
        return address;
    } catch (error) {
        console.error('Reverse geocode error:', error);
        return null;
    }
}

async function updateActivitiesWithLocations() {
    const users = await User.find();
    for (const user of users) {
        if (user.activities && user.activities.length > 0) {
            let cities = new Set(user.myCity); // Usar Set para evitar duplicatas
            const geocodePromises = [];
            for (const activity of user.activities) {
                if (activity.coordinates && activity.coordinates.length > 0) {
                    for (let i = 0; i < activity.coordinates.length; i += 10) {
                        const [lat, lon] = activity.coordinates[i];
                        const promise = limit(() => reverseGeocode(lat, lon).then(locationData => {
                            if (locationData) {
                                const concelho = locationData.city || locationData.town || locationData.municipality;
                                if (concelho && !user.distritosConcelhos.includes(concelho)) {
                                    user.distritosConcelhos.push(concelho);
                                    cities.add(concelho);
                                }
                            }
                        }));
                        geocodePromises.push(promise);
                    }
                }
            }
            await Promise.all(geocodePromises);
            user.myCity = Array.from(cities); // Converter Set para Array
            // Save only myCity
            await User.updateOne({ _id: user._id }, {
                $set: {
                    myCity: user.myCity
                }
            });
        }
    }
    console.log('Reverse geocoding completed and database updated.');
}

updateActivitiesWithLocations().then(() => mongoose.disconnect());
