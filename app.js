const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;


app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');


app.use('/', indexRouter);
app.use('/admin', adminRouter);


mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB Atlas:', err));


app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.get('/api/weather/:city', async (req, res) => {
    try {
        const city = req.params.city;
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        const response = await axios.get(weatherUrl);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).send('Error fetching weather data');
    }
});

app.get('/api/aqi/:lat/:lon', async (req, res) => {
    try {
        const lat = req.params.lat;
        const lon = req.params.lon;
        const apiKey = process.env.AQI_API_KEY;
        const aqiUrl = `http://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${apiKey}`;

        const response = await axios.get(aqiUrl);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching AQI data:', error);
        res.status(500).send('Error fetching AQI data');
    }
});

app.get('/api/city/:name', async (req, res) => {
    const cityName = req.params.name;
    const apiKey = process.env.NINJA_API_KEY;

    try {
        const response = await axios.get('https://api.api-ninjas.com/v1/worldtime?city=' + cityName, {
            params: { name: cityName },
            headers: { 'X-Api-Key': apiKey }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching city data:', error);
        if (error.response) {
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(500).send('Error fetching city data');
        }
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
