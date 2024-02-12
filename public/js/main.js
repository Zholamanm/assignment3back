let AQI = 0
let CITY = ''

document.getElementById('search-button').addEventListener('click', function() {
    const city = document.getElementById('city-input').value;
    if (city) {
        fetchWeatherData(city);
        CITY = city
    }
});

function fetchWeatherData(city) {
    fetch(`/api/weather/${city}`)
        .then(response => response.json())
        .then(data => {
            displayWeatherData(data);
            displayMap(data.coord.lat, data.coord.lon);
            fetchAQIData(data.coord.lat, data.coord.lon);
            fetchCityData(city);
        })
        .catch(error => console.error('Error:', error));
}


function displayWeatherData(data) {
    const weatherInfoDiv = document.getElementById('weather-info');
    if (!weatherInfoDiv) {
        console.error('Weather info div not found');
        return;
    }

    const temp = data.main.temp;
    const feelsLike = data.main.feels_like;
    const tempMin = data.main.temp_min;
    const tempMax = data.main.temp_max;
    const pressure = data.main.pressure;
    const humidity = data.main.humidity;
    const weatherDescription = data.weather[0].description;
    const windSpeed = data.wind.speed;
    const country = data.sys.country;
    const cityName = data.name;

    weatherInfoDiv.innerHTML = `
        <h2>Weather in ${cityName}, ${country}</h2>
        <p><strong>Temperature:</strong> ${temp}°C</p>
        <p><strong>Feels Like:</strong> ${feelsLike}°C</p>
        <p><strong>Minimum Temperature:</strong> ${tempMin}°C</p>
        <p><strong>Maximum Temperature:</strong> ${tempMax}°C</p>
        <p><strong>Pressure:</strong> ${pressure} hPa</p>
        <p><strong>Humidity:</strong> ${humidity}%</p>
        <p><strong>Weather:</strong> ${weatherDescription}</p>
        <p><strong>Wind Speed:</strong> ${windSpeed} m/s</p>
    `;
}

function displayMap(lat, lon) {

    const container = L.DomUtil.get('map');
    if (container != null) {
        container._leaflet_id = null;
    }

    const map = L.map('map').setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>Location:</b> ${lat}, ${lon}`)
        .openPopup();
}

function fetchAQIData(lat, lon) {
    fetch(`/api/aqi/${lat}/${lon}`)
        .then(response => response.json())
        .then(aqiData => {
            displayAQIData(aqiData);
        })
        .catch(error => console.error('Error fetching AQI data:', error));
}

function displayAQIData(aqiData) {
    const aqiInfoDiv = document.getElementById('set-aqi');
    if (!aqiInfoDiv) {
        console.error('AQI info div not found');
        return;
    }
    AQI = aqiData.data.current.pollution.aqius
    aqiInfoDiv.value = AQI
}

function setDial(aqi) {
    let angle = getAQIDialAngle(aqi);
    let [bg, white] = getAQIColor(aqi);

    let meter = document.querySelector(".gauge > div[role=meter]");
    let dial = meter.querySelector(".dial");
    meter.setAttribute("aria-valuenow", aqi);
    meter.setAttribute("aria-valuetext", aqi);
    dial.querySelector(".aqi-num").textContent = aqi;
    dial.querySelector(".arrow").style.transform = `rotate(${angle - 90}deg)`;
    dial.style.backgroundColor = bg;
    dial.classList.toggle("white", white);
}


function getAQIDialAngle(aqi) {
    if (aqi >= 301) {
        return Math.min((aqi - 301) / 200 * 30 + 150, 180);
    } else if (aqi >= 201) {
        return (aqi - 201) / 100 * 30 + 120;
    } else if (aqi >= 151) {
        return (aqi - 151) / 50 * 30 + 90;
    } else if (aqi >= 101) {
        return (aqi - 101) / 50 * 30 + 60;
    } else if (aqi >= 51) {
        return (aqi - 51) / 50 * 30 + 30;
    } else if (aqi >= 0) {
        return aqi / 50 * 30;
    } else {
        return 0;
    }
}

function getAQIColor(aqi) {
    function combineColors(c1, c2, bias) {
        return c1.map((c, i) => ((c * (1 - bias)) + (c2[i] * bias)));
    }

    function stringifyColor(c) {
        return `rgb(${c})`;
    }

    function calculateColors(c1, c2, bias) {
        let bg = combineColors(c1, c2, bias);
        let white = ((bg[0] * 299) + (bg[1] * 587) + (bg[2] * 114)) / 1000 < 128;
        return [stringifyColor(bg), white];
    }

    const aqiColorMap = [
        [0, [0, 255, 0]],
        [50, [255, 255, 0]],
        [100, [255, 126, 0]],
        [150, [255, 0, 0]],
        [200, [143, 63, 151]],
        [300, [126, 0, 35]]
    ];

    for (let i in aqiColorMap) {
        let [target, color] = aqiColorMap[i];
        if (target > aqi) {
            if (i == 0) {
                return calculateColors(color, color, 1);
            }

            let [prevTarget, prevColor] = aqiColorMap[i - 1];
            return calculateColors(prevColor, color, (aqi - prevTarget) / (target - prevTarget));
        }
    }

    let [, color] = aqiColorMap[aqiColorMap.length - 1];
    return calculateColors(color, color, 1);
}

let aqiCheck = document.getElementById("aqi_check");
setDial(AQI);

aqiCheck.addEventListener('click', function () {
    setDial(AQI)
})

let currentCityTime = null;
let currentCityTimeTimer = null;

function fetchCityData(cityName) {
    fetch(`/api/city/${cityName}`)
        .then(response => response.json())
        .then(cityData => {
            if (cityData) {
                initializeCityTime(cityData.datetime);
            }
        })
        .catch(error => console.error('Error fetching city data:', error));
}

function initializeCityTime(datetime) {
    currentCityTime = new Date(datetime);

    if (!currentCityTimeTimer) {
        updateCityTimeEverySecond();
    }
}

function updateCityTimeEverySecond() {
    if (currentCityTimeTimer) {
        clearInterval(currentCityTimeTimer);
    }
    currentCityTimeTimer = setInterval(() => {
        currentCityTime = new Date(currentCityTime.getTime() + 1000);
        displayCurrentTime(currentCityTime);
    }, 1000);
}

function displayCurrentTime(currentTime) {
    setClockWithCurrentTime(currentTime);
}

function updateClock(hours, minutes, seconds) {

    var hourDegrees = hours * 30;
    var minuteDegrees = minutes * 6;
    var secondDegrees = seconds * 6;

    $('.hour-hand').css({
        'transform': `rotate(${hourDegrees}deg)`
    });

    $('.minute-hand').css({
        'transform': `rotate(${minuteDegrees}deg)`
    });

    $('.second-hand').css({
        'transform': `rotate(${secondDegrees}deg)`
    });

}



function setClockWithCurrentTime(currentTime) {

    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');

    updateClock(hours, minutes, seconds);
}

