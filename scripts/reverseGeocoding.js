const mongoose = require('mongoose');
const User = require('../models/User');
const Progress = require('../models/Progress');
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

async function updateActivitiesWithLocations(userId) {
    const user = await User.findById(userId);
    if (user.activities && user.activities.length > 0) {
        let cities = new Set(user.myCity);  // Usar Set para evitar duplicatas
        const totalActivities = user.activities.length;
        let activitiesProcessed = 0;
        const startTime = Date.now();

        for (const activity of user.activities) {
            if (activity.coordinates && activity.coordinates.length > 0) {
                for (const coord of activity.coordinates) {
                    const [lat, lon] = coord;
                    const locationData = await reverseGeocode(lat, lon);
                    if (locationData) {
                        const concelho = locationData.city || locationData.town || locationData.municipality;
                        if (concelho && !user.distritosConcelhos.includes(concelho)) {
                            user.distritosConcelhos.push(concelho);
                            cities.add(concelho);  // Adicionar a cidade ao Set
                        }
                    }
                }
            }
            activitiesProcessed++;
            const progress = (activitiesProcessed / totalActivities) * 100;
            const elapsedTime = (Date.now() - startTime) / 1000; // Time in seconds
            const estimatedTime = (elapsedTime / activitiesProcessed) * (totalActivities - activitiesProcessed);

            await Progress.findOneAndUpdate(
                { userId: userId },
                { progress: progress, estimatedTime: estimatedTime },
                { upsert: true, new: true }
            );
        }
        user.myCity = Array.from(cities);  // Converter Set para Array
        await user.save();
    }
    console.log('Reverse geocoding completed and database updated.');
}

const userId = process.argv[2]; // Pass userId as a command line argument
updateActivitiesWithLocations(userId).then(() => mongoose.disconnect());
