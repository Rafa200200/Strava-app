const mongoose = require('mongoose');
const User = require('../models/User');
const nominatim = require('nominatim-client');

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

async function reverseGeocode(lat, lon) {
    try {
        console.log(`Reverse geocoding for lat: ${lat}, lon: ${lon}`);
        const response = await client.reverse({
            lat: lat,
            lon: lon,
            zoom: 10,
            addressdetails: true
        });
        console.log('Reverse geocode response:', response);
        return response.address;
    } catch (error) {
        console.error('Reverse geocode error:', error);
        return null;
    }
}

async function updateActivitiesWithLocations() {
    const users = await User.find();
    for (const user of users) {
        if (user.activities && user.activities.length > 0) {
            let cities = new Set(user.myCity);  // Usar Set para evitar duplicatas
            for (const activity of user.activities) {
                if (activity.coordinates && activity.coordinates.length > 0) {
                    for (const coord of activity.coordinates) {
                        const [lat, lon] = coord;
                        const locationData = await reverseGeocode(lat, lon);
                        if (locationData) {
                            // Atualizar concelhos
                            const concelho = locationData.city || locationData.town || locationData.municipality;
                            if (concelho && !user.distritosConcelhos.includes(concelho)) {
                                user.distritosConcelhos.push(concelho);
                                cities.add(concelho);  // Adicionar a cidade ao Set
                            }
                        }
                    }
                }
            }
            user.myCity = Array.from(cities);  // Converter Set para Array
            await user.save();
        }
    }
    console.log('Reverse geocoding completed and database updated.');
}

updateActivitiesWithLocations().then(() => mongoose.disconnect());
