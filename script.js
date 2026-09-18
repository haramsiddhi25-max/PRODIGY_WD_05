const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");

const weatherContent = document.getElementById("weatherContent");
const emptyState = document.getElementById("emptyState");

const locationName = document.getElementById("locationName");
const locationDetails = document.getElementById("locationDetails");

const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");

const weatherCondition = document.getElementById("weatherCondition");
const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const cloudCover = document.getElementById("cloudCover");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const currentDate = document.getElementById("currentDate");
const currentTime = document.getElementById("currentTime");

const forecastContainer =
    document.getElementById("forecastContainer");


// --------------------------------------------------
// WEATHER CODE INFORMATION
// --------------------------------------------------

function getWeatherInfo(code) {

    const weatherCodes = {

        0: {
            condition: "Clear Sky",
            icon: "☀️"
        },

        1: {
            condition: "Mainly Clear",
            icon: "🌤️"
        },

        2: {
            condition: "Partly Cloudy",
            icon: "⛅"
        },

        3: {
            condition: "Overcast",
            icon: "☁️"
        },

        45: {
            condition: "Foggy",
            icon: "🌫️"
        },

        48: {
            condition: "Rime Fog",
            icon: "🌫️"
        },

        51: {
            condition: "Light Drizzle",
            icon: "🌦️"
        },

        53: {
            condition: "Drizzle",
            icon: "🌦️"
        },

        55: {
            condition: "Heavy Drizzle",
            icon: "🌧️"
        },

        61: {
            condition: "Light Rain",
            icon: "🌦️"
        },

        63: {
            condition: "Rain",
            icon: "🌧️"
        },

        65: {
            condition: "Heavy Rain",
            icon: "🌧️"
        },

        71: {
            condition: "Light Snow",
            icon: "🌨️"
        },

        73: {
            condition: "Snow",
            icon: "❄️"
        },

        75: {
            condition: "Heavy Snow",
            icon: "❄️"
        },

        80: {
            condition: "Rain Showers",
            icon: "🌦️"
        },

        81: {
            condition: "Rain Showers",
            icon: "🌧️"
        },

        82: {
            condition: "Heavy Showers",
            icon: "⛈️"
        },

        95: {
            condition: "Thunderstorm",
            icon: "⛈️"
        },

        96: {
            condition: "Thunderstorm with Hail",
            icon: "⛈️"
        },

        99: {
            condition: "Severe Thunderstorm",
            icon: "⛈️"
        }

    };

    return weatherCodes[code] || {
        condition: "Unknown Weather",
        icon: "🌤️"
    };
}


// --------------------------------------------------
// SHOW LOADING
// --------------------------------------------------

function showLoading() {

    loading.classList.remove("hidden");

    errorMessage.classList.add("hidden");

    weatherContent.classList.add("hidden");

    emptyState.classList.add("hidden");
}


// --------------------------------------------------
// HIDE LOADING
// --------------------------------------------------

function hideLoading() {

    loading.classList.add("hidden");
}


// --------------------------------------------------
// SHOW ERROR
// --------------------------------------------------

function showError(message) {

    hideLoading();

    weatherContent.classList.add("hidden");

    emptyState.classList.add("hidden");

    errorText.textContent = message;

    errorMessage.classList.remove("hidden");
}


// --------------------------------------------------
// SEARCH CITY
// --------------------------------------------------

async function searchCity() {

    const city = cityInput.value.trim();

    if (!city) {

        showError("Please enter a city name.");

        return;
    }

    showLoading();

    try {

        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!response.ok) {
            throw new Error("Location search failed.");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {

            throw new Error(
                "Location not found. Please try another city."
            );
        }

        const place = data.results[0];

        await getWeather(
            place.latitude,
            place.longitude,
            place.name,
            place.admin1,
            place.country
        );

    } catch (error) {

        showError(
            error.message ||
            "Something went wrong while finding the location."
        );

    }

}


// --------------------------------------------------
// GET WEATHER DATA
// --------------------------------------------------

async function getWeather(
    latitude,
    longitude,
    name,
    state = "",
    country = ""
) {

    showLoading();

    try {

        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,surface_pressure,wind_speed_10m` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
            `&timezone=auto` +
            `&forecast_days=5`;

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error(
                "Unable to fetch weather data."
            );
        }

        const data = await response.json();

        displayWeather(
            data,
            name,
            state,
            country
        );

    } catch (error) {

        showError(
            error.message ||
            "Unable to fetch weather information."
        );

    }

}


// --------------------------------------------------
// DISPLAY WEATHER
// --------------------------------------------------

function displayWeather(
    data,
    name,
    state,
    country
) {

    hideLoading();

    errorMessage.classList.add("hidden");

    emptyState.classList.add("hidden");

    weatherContent.classList.remove("hidden");


    // Location

    locationName.textContent = name;

    const details = [state, country]
        .filter(Boolean)
        .join(", ");

    locationDetails.textContent =
        details || "Location";


    // Current weather

    const current = data.current;

    const weatherInfo =
        getWeatherInfo(current.weather_code);


    temperature.textContent =
        Math.round(current.temperature_2m);

    feelsLike.textContent =
        Math.round(current.apparent_temperature);

    humidity.textContent =
        current.relative_humidity_2m;

    windSpeed.textContent =
        Math.round(current.wind_speed_10m);

    pressure.textContent =
        Math.round(current.surface_pressure);

    cloudCover.textContent =
        current.cloud_cover;

    weatherCondition.textContent =
        weatherInfo.condition;

    weatherIcon.textContent =
        weatherInfo.icon;


    // Current date/time

    updateDateTime();


    // Sunrise / sunset

    sunrise.textContent =
        formatTime(data.daily.sunrise[0]);

    sunset.textContent =
        formatTime(data.daily.sunset[0]);


    // Forecast

    createForecast(data.daily);

}


// --------------------------------------------------
// FORECAST
// --------------------------------------------------

function createForecast(daily) {

    forecastContainer.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {

        const weatherInfo =
            getWeatherInfo(
                daily.weather_code[i]
            );

        const date =
            new Date(
                daily.time[i] + "T12:00:00"
            );

        const dayName =
            i === 0
                ? "Today"
                : date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );

        const maxTemp =
            Math.round(
                daily.temperature_2m_max[i]
            );

        const minTemp =
            Math.round(
                daily.temperature_2m_min[i]
            );

        const card =
            document.createElement("div");

        card.className =
            "forecast-card";

        card.innerHTML = `

            <div class="forecast-day">
                ${dayName}
            </div>

            <div class="forecast-icon">
                ${weatherInfo.icon}
            </div>

            <div class="forecast-temp">
                ${maxTemp}°C
            </div>

            <div class="forecast-range">
                Low ${minTemp}°C
            </div>

            <div class="forecast-condition">
                ${weatherInfo.condition}
            </div>

        `;

        forecastContainer.appendChild(card);
    }

}


// --------------------------------------------------
// FORMAT TIME
// --------------------------------------------------

function formatTime(timeString) {

    if (!timeString) {
        return "--:--";
    }

    const time =
        timeString.split("T")[1];

    const [hours, minutes] =
        time.split(":");

    const date =
        new Date();

    date.setHours(
        Number(hours),
        Number(minutes)
    );

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// --------------------------------------------------
// DATE / TIME
// --------------------------------------------------

function updateDateTime() {

    const now = new Date();

    currentDate.textContent =
        now.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "short",
                day: "numeric"
            }
        );

    currentTime.textContent =
        now.toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

}


// --------------------------------------------------
// USER LOCATION
// --------------------------------------------------

function useMyLocation() {

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported by your browser."
        );

        return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            try {

                // Reverse geocoding

                const response =
                    await fetch(
                        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
                    );

                let placeName =
                    "My Location";

                let state = "";
                let country = "";

                if (response.ok) {

                    const data =
                        await response.json();

                    if (
                        data.results &&
                        data.results.length > 0
                    ) {

                        const place =
                            data.results[0];

                        placeName =
                            place.name ||
                            "My Location";

                        state =
                            place.admin1 || "";

                        country =
                            place.country || "";
                    }
                }

                await getWeather(
                    latitude,
                    longitude,
                    placeName,
                    state,
                    country
                );

            } catch {

                await getWeather(
                    latitude,
                    longitude,
                    "My Location",
                    "",
                    ""
                );

            }

        },

        () => {

            showError(
                "Location access was denied. Please allow location permission or search for a city manually."
            );

        }

    );

}


// --------------------------------------------------
// EVENTS
// --------------------------------------------------

searchBtn.addEventListener(
    "click",
    searchCity
);

locationBtn.addEventListener(
    "click",
    useMyLocation
);

cityInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            searchCity();

        }

    }
);


// Update clock

setInterval(
    updateDateTime,
    60000
);