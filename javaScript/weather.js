// Variabler för div-elementen för temperatur, vädersymbol, vind hastighet och nederbörd
const temperaturContainer = document.getElementById('temperature-container')
const weatherSymbolContainer = document.getElementById('weather-symbol-container');
const windContainer = document.getElementById('wind-container')
const precipitationContainer = document.getElementById('precipitation-container')

let weatherSymbol;
let cityInput = document.getElementById('search-weather');

let temperatureChart;
let citiesArray = [];
let temperaturesArray = []

// Local storage av stadens namn
let saveCity = localStorage.getItem('saveCity');
let saveCitiesArray = localStorage.getItem('saveCitiesArray')
let saveTemperaturesArray = localStorage.getItem('saveTemperaturesArray')

// Denna körs en gång och lägger in det senast sparade värdet
if(saveCity){

  cityInput.value = saveCity;

  // Functionen körs för att uppdatera med aktuell väderprognos
  getWeather();

}

// Event listener som lyssnar på om knappen weather-search-btn klickas. Då startar getWeather function.
document.getElementById('weather-search-btn').addEventListener("click", getWeather)

async function getWeather(){

    // Här hämtas staden från inputvärdet i textboxen
    const cityInputValue = cityInput.value

    // Här sparas inputvärdet i localStorage så att man kan gå ur och komma tillbaka och ändå se den senast sökta staden
    localStorage.setItem('saveCity', cityInputValue)

    // Använder axios biblioteket för skicka en GET förfrågan till Geoapify-APIet
    let geoResult = (await axios.get(`https://api.geoapify.com/v1/geocode/search?city=${cityInputValue}&state=${cityInputValue}&country=Sweden&lang=en&limit=1&type=city&format=json&apiKey=58e3667c44f64bc2adfd18a7d67ba5f1`)).data;

    // Till variablerna latitude och longitude hämtas värden från informationen hämtad från geo-APIet.
    const latitude = geoResult.results[0].lat
    const longitud = geoResult.results[0].lon
    console.log(latitude, longitud)

    // Här anropas väder-apiet
    // await uttrycket axios.get promise väntar på värderna för longitud och latitdud. Utan denna delen så hade koden körts utan att få med variablerna.

    // let weatherReport = (await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitud}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=Europe%2FLondon`)).data

    let weatherReport = (await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitud}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m&forecast_days=1`)).data

    //Hämtar värdena från
    const currentTemperature = weatherReport.current.temperature_2m
    const weatherCode = weatherReport.current.weather_code
    const precipitation = weatherReport.current.precipitation
    const windSpeed = weatherReport.current.wind_speed_10m
    let temperatureArray = []
    let dateTime = []

    console.log(weatherReport)
    console.log(weatherReport.hourly.temperature_2m.length, 'Detta är längden på apiet')

    const tempPerHour = []

    for(let i=0; i<weatherReport.hourly.temperature_2m.length; i++){

      temperatureArray.push(weatherReport.hourly.temperature_2m[i])
      let time = weatherReport.hourly.time[i]
      dateTime.push(time.slice(11))
    }

    console.log(temperatureArray , dateTime)

    //Felsöker/kollar vilka värden som hämtats
    console.log(currentTemperature,'°C')
    console.log(weatherCode, 'väderkod')
    console.log('precipitation: ', precipitation, 'mm')
    console.log(windSpeed/3.6, 'm/s')
    console.log(weatherReport)

    // Här skickas de hämtade värdena till olika element i html dokumentet.
    // Jag har valt att runda av värdena, då jag ansåg att decimaler är ointressant i sammanhanget.
    temperaturContainer.innerHTML =`<p id="temperature">${Math.round(currentTemperature)}°C</p>`
    // 3.6 omvandlar km/h till m/s
    windContainer.innerHTML =`<p id="wind">${Math.round(windSpeed/3.6)} m/s`
    precipitationContainer.innerHTML =` <span id="precipitation">Precipitation:</span><span id="precipitation"> ${Math.round(precipitation)}</span>`



    // =============== CHART ===================//

    console.log(cityInputValue, currentTemperature)

    //Gör om inputvärdet till småbokstäver för att kunna jämföra med de namn som finns i citiesArrayen
    let cityNameAsLowerCase = cityInputValue.toLowerCase();

    if (citiesArray.map(value => value.toLowerCase()).includes(cityNameAsLowerCase)) {
      console.log('The city already exists');
    } else {
      console.log('The city didn\'t already exist');
      console.log(cityInputValue, 'stadens namn');

      // Här läggs staden och temperaturen till i varsin array.

      citiesArray.push(cityInputValue);
      temperaturesArray.push(Math.round(currentTemperature));

      localStorage.setItem('saveCitiesArray', citiesArray)
      localStorage.setItem('saveTemperaturesArray', temperaturesArray)
      console.log(citiesArray, 'stads array');


      // Lägg element med function vid
      // document.getElementById("").addEventListener("click", () => {
      //   document.getElementById("myButton").focus();});

      console.log(temperatureChart, 'charten innan den skrivs ut');
      // Chart.defaults.color = '#fff';
      if (!temperatureChart) {
        temperatureChart = document.getElementById('weather-chart');
        // Skapa ett nytt diagram om det inte redan finns
        temperatureChart = new Chart(document.getElementById('weather-chart'), {
          type: 'line',
          data: {
            labels: dateTime,
            datasets: [{
              label: `Daily temperature variation in ${cityInputValue}`,
              data: temperatureArray,
              backgroundColor: 'white',
              borderColor: 'red',
              color: '#fff',
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,

              }
            },
            maintainAspectRatio: false, // Set to false to allow the chart to be responsive.
            responsive: true, // Enable responsiveness.
          }
        });
      } else {

        // Uppdatera befintligt diagram om det redan finns
        temperatureChart.data.labels = dateTime;
        temperatureChart.data.datasets[0].label =`Daily Temperature Variation in ${cityInputValue}`;
        temperatureChart.data.datasets[0].data = temperatureArray;

        temperatureChart.update();
      }
    }



    // weatherCode har fått en siffra som är kopplat till ett specifikt väderförhållande.
    // Beroende på weatherCodes värde så tilldelas varibeln weatherSymbol en bild, svg eller png som illustrerar det vädret.
    switch(weatherCode) {
      case 0:
        console.log('Clear sky')
        weatherSymbol = '<svg id="weather-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 199.8 110.76"><defs><style>.cls-1{stroke-width:0px;}</style></defs><g id="Lager_1-2"><path class="cls-1" d="m107.73,110.71c-20.83,0-41.66-.12-62.49.05-13.82.11-23.7-5.31-28.74-18.64-.56-1.47-2.34-2.68-3.82-3.56-14.25-8.49-16.81-24.36-6.05-36.96,1.07-1.25,1.62-3.54,1.38-5.2-2.14-15.01,7.47-26.44,22.75-27.02,1.5-.06,3.53-1.08,4.34-2.31,14.32-21.68,43.53-21.86,58.33-5.28.79.89,3.65,1.01,4.83.3,22.5-13.51,45.22-8.66,60.74,12.99.86,1.2,2.84,2.19,4.34,2.25,19.24.77,29.82,13.7,26.86,32.62-.28,1.77,1.16,4.25,2.51,5.78,13.46,15.18,6.87,38.67-12.61,43.96-3.62.98-7.59.96-11.4.98-20.33.09-40.66.04-60.99.05Zm-1.04-5.05s0,.09,0,.13c5.66,0,11.33,0,16.99,0,16.16,0,32.32.07,48.48-.02,9.89-.06,18.07-5.39,20.97-13.33,3.67-10.06,1.61-18.67-6.68-25.55-2.66-2.21-2.41-4.21-1.59-6.95,4.53-15.22-6.82-29-22.66-27.3-3.35.36-4.99-.43-6.67-3.34-8.09-14.01-20.41-20.86-36.55-19.37-16.18,1.49-27,10.6-32.18,25.89-1.55,4.57-3.12,5.41-7.74,4.01-13.15-4-27.04,4.06-30.11,17.42-.95,4.11-3.04,4.44-6.49,5.08-4.91.91-10.24,2.12-14.23,4.88-7.56,5.21-9.85,15.36-6.78,24.23,2.87,8.31,10.58,14.12,19.76,14.18,21.82.16,43.65.05,65.47.05ZM14.4,83.43c.42-.54.74-.78.8-1.06,3.56-16.81,8.87-21.89,26.17-25.31,1.19-.24,2.8-1.4,3.13-2.47,4.86-15.44,20.13-22.95,34.16-20.26,1.15.22,3.2-.74,3.82-1.76,2.99-4.93,5.63-10.06,8.61-15.52-.24-.32-.77-1.16-1.43-1.88C74.95-.71,50.35,2.11,38.68,21.17c-1.74,2.84-3.23,3.73-6.62,3.38-12.65-1.32-22.21,10-18.7,22.17.98,3.39.53,5.28-2.16,7.66-9.59,8.52-8,22.65,3.19,29.05Z"/></g></svg>'
        break;
      case 1:
      case 2:
            console.log('Partly Cloudy');
            weatherSymbol = '<img id="weather-symbol" src="./media/icons/PNG/partlyCloudy.png" alt="partly cloudy">';
        break;
      case 3:
        console.log('Overcast')
        weatherSymbol = '<svg id="weather-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 199.8 110.76"><defs><style>.cls-1{stroke-width:0px;}</style></defs><g id="Lager_1-2"><path class="cls-1" d="m107.73,110.71c-20.83,0-41.66-.12-62.49.05-13.82.11-23.7-5.31-28.74-18.64-.56-1.47-2.34-2.68-3.82-3.56-14.25-8.49-16.81-24.36-6.05-36.96,1.07-1.25,1.62-3.54,1.38-5.2-2.14-15.01,7.47-26.44,22.75-27.02,1.5-.06,3.53-1.08,4.34-2.31,14.32-21.68,43.53-21.86,58.33-5.28.79.89,3.65,1.01,4.83.3,22.5-13.51,45.22-8.66,60.74,12.99.86,1.2,2.84,2.19,4.34,2.25,19.24.77,29.82,13.7,26.86,32.62-.28,1.77,1.16,4.25,2.51,5.78,13.46,15.18,6.87,38.67-12.61,43.96-3.62.98-7.59.96-11.4.98-20.33.09-40.66.04-60.99.05Zm-1.04-5.05s0,.09,0,.13c5.66,0,11.33,0,16.99,0,16.16,0,32.32.07,48.48-.02,9.89-.06,18.07-5.39,20.97-13.33,3.67-10.06,1.61-18.67-6.68-25.55-2.66-2.21-2.41-4.21-1.59-6.95,4.53-15.22-6.82-29-22.66-27.3-3.35.36-4.99-.43-6.67-3.34-8.09-14.01-20.41-20.86-36.55-19.37-16.18,1.49-27,10.6-32.18,25.89-1.55,4.57-3.12,5.41-7.74,4.01-13.15-4-27.04,4.06-30.11,17.42-.95,4.11-3.04,4.44-6.49,5.08-4.91.91-10.24,2.12-14.23,4.88-7.56,5.21-9.85,15.36-6.78,24.23,2.87,8.31,10.58,14.12,19.76,14.18,21.82.16,43.65.05,65.47.05ZM14.4,83.43c.42-.54.74-.78.8-1.06,3.56-16.81,8.87-21.89,26.17-25.31,1.19-.24,2.8-1.4,3.13-2.47,4.86-15.44,20.13-22.95,34.16-20.26,1.15.22,3.2-.74,3.82-1.76,2.99-4.93,5.63-10.06,8.61-15.52-.24-.32-.77-1.16-1.43-1.88C74.95-.71,50.35,2.11,38.68,21.17c-1.74,2.84-3.23,3.73-6.62,3.38-12.65-1.32-22.21,10-18.7,22.17.98,3.39.53,5.28-2.16,7.66-9.59,8.52-8,22.65,3.19,29.05Z"/></g></svg>'
        break;
      case 45:
      case 48:
        console.log('Fog')
        weatherSymbol = ' <img id="weather-symbol" src="/media/icons/PNG/fog.png" alt="fog"/>'
        break;
      case 51:
      case 61:
      case 80:
        console.log('Rain showers Slight')
        weatherSymbol = '<svg id="weather-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184.59 132.28"><defs><style>.cls-1{stroke-width:0px;}</style></defs><g id="Lager_1-2"><path class="cls-1" d="m64.5,30.02c5.37-7.03,9.32-14.22,15.09-19.36,19.36-17.26,48.87-12.98,63.15,8.63,1.76,2.67,3.36,3.7,6.72,3.66,16.85-.25,28.67,14.72,25.69,31.84-.3,1.71.36,4.18,1.5,5.45,7.77,8.62,10.13,18.37,5.79,29.11-4.43,10.97-13.15,16.62-24.89,16.82-15.16.26-30.33.05-45.49-.17-1.58-.02-3.14-1.49-4.71-2.29,1.57-.81,3.13-2.29,4.71-2.32,14.83-.22,29.66-.47,44.49-.18,17.32.34,27.95-16.83,20.72-31.44-1.36-2.75-3.42-5.4-5.78-7.35-2.44-2.02-3.17-3.66-2.11-6.74,5.93-17.14-10.18-30.94-23.49-27.38-3.32.89-4.22-1.51-5.55-3.7-8.57-14.15-21.09-21.15-37.65-19.17-15.68,1.87-26.16,10.93-31.22,25.82-1.43,4.2-2.77,5.36-7.36,3.98-13.17-3.98-26.25,3.23-30.19,16.64-1.29,4.39-3.22,5.64-7.57,5.72-10.87.19-19.55,7.76-21.06,17.73-1.7,11.22,3.6,21.01,14.25,24.43,4.61,1.48,9.83,1.13,14.79,1.37,4.65.22,9.33,0,13.98.26.99.06,1.91,1.37,2.86,2.11-.81.87-1.64,2.51-2.42,2.49-10.74-.4-21.72,2.14-32.17-1.99C4.83,99.37-1.51,87.84.31,75.07c1.7-11.89,11.87-21.25,24.06-22.5,1.73-.18,4.2-1.43,4.82-2.85,7-15.81,17.4-21.92,34.37-19.8.8.1,1.61.18.94.11Z"/><path class="cls-1" d="m56.88,111.7c1.42-3.84,2.36-7.94,4.36-11.45,4.27-7.49,9.06-14.68,13.69-21.97,2.59-4.07,4.07-4.12,6.77.05,4.95,7.67,9.9,15.34,14.51,23.21,4.62,7.89,3.4,17.06-2.7,24.05-5.4,6.19-14.23,8.32-22.23,5.39-8.15-2.99-13.49-10.44-14.39-19.27Zm21.45-29.68c-5.16,8.35-9.94,15.52-14.11,23.03-3.53,6.36-1.52,14.13,4.16,18.9,5.1,4.29,13.74,4.56,19.05.6,6.17-4.61,8.63-12.28,5.08-19.04-4.06-7.73-9-15-14.18-23.49Z"/><path class="cls-1" d="m117.53,84.63c-9.24-.28-15.55-9.86-11.53-18.1,2.61-5.36,6.02-10.34,9.23-15.39,1.73-2.72,3.76-2.48,5.41.17,3.07,4.94,6.42,9.74,8.98,14.94,4.28,8.7-2.45,18.67-12.08,18.38Zm.34-28.5c-2.63,4.24-4.93,7.66-6.93,11.25-2.09,3.76-1.7,7.44,1.64,10.3,3.33,2.85,7.13,2.82,10.45.13,3.38-2.74,3.86-6.53,1.84-10.3-1.94-3.61-4.29-7.01-7-11.38Z"/></g></svg>'
        break;
      case 53:
      case 63:
      case 81:
        console.log('rain moderate')
        weatherSymbol = '<svg id="weather-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184.78 138.19"><defs><style>.cls-1{stroke-width:0px;}</style></defs><g id="Lager_1-2"><path class="cls-1" d="m66.49,30c5.62-15.15,15.76-25.12,31.45-28.88,17.38-4.17,35.78,3.51,45.56,18.57.99,1.53,3.53,2.91,5.36,2.92,17.51.16,29.49,14.59,26.31,31.75-.32,1.73.4,4.24,1.57,5.58,7.57,8.63,10.35,18.28,5.96,29.1-4.43,10.92-13.01,16.93-24.76,16.99-43.81.22-87.62.27-131.43,0C11.71,105.93.5,94.37.02,80.07c-.48-14.41,10.18-25.92,25.35-27.59,1.35-.15,3.19-1.14,3.77-2.27,9.32-18.2,16.62-22.27,37.36-20.2Zm25.93,71.14v-.02c21.65,0,43.3.06,64.94-.03,9.89-.04,17.57-5.38,20.92-14.16,3.36-8.82,1.23-17.88-6.4-24.32-2.84-2.4-3.03-4.45-2.07-7.71,4.45-15.12-7.47-28.95-23.09-26.84-2.94.4-4.53-.3-6.02-2.9-8.54-15-21.55-22-38.67-19.65-15.86,2.17-26.05,11.78-30.91,26.89-1.09,3.38-2.4,4.11-5.72,3.14-14.73-4.32-27.44,2.49-31.54,17-1.04,3.69-2.64,5.1-6.55,4.98-9.2-.29-16.2,4.02-20.1,12.19-7.22,15.15,3.19,31.23,20.24,31.39,21.65.21,43.3.05,64.94.05Z"/><path class="cls-1" d="m60.31,137.07c-.32-1.33-1.27-2.9-.87-3.95,2.06-5.39,4.35-10.71,6.87-15.9.43-.9,2.31-1.1,3.51-1.63.3,1.16,1.17,2.55.81,3.45-2.13,5.37-4.54,10.62-6.84,15.92-.46,1.06-.85,2.15-1.27,3.23-.74-.37-1.48-.75-2.21-1.12Z"/><path class="cls-1" d="m23.56,137.22c-.56-1.28-1.63-2.53-1.34-3.25,2.32-5.84,4.82-11.61,7.48-17.3.31-.67,2.11-1.27,2.82-.97.7.29,1.52,2.02,1.24,2.7-2.35,5.82-4.89,11.57-7.5,17.29-.26.57-1.31.78-2.71,1.54Z"/><path class="cls-1" d="m134.88,137.53c-.71-1.66-1.86-3.03-1.54-3.83,2.23-5.7,4.67-11.33,7.3-16.86.36-.75,2.16-.82,3.29-1.21.34,1.01,1.23,2.24.92,2.99-2.24,5.52-4.68,10.97-7.18,16.38-.36.77-1.35,1.25-2.79,2.53Z"/><path class="cls-1" d="m108.33,117.91c-2.72,6.09-5.3,12.02-8.11,17.84-.28.57-2.23.9-2.98.51-.65-.34-1.23-2.06-.93-2.8,2.24-5.53,4.62-11.02,7.21-16.4.39-.81,2.04-1.29,3.15-1.36.48-.03,1.05,1.35,1.66,2.2Z"/></g></svg>'
        break;
      case 55:
      case 65:
      case 82:
        console.log('Rain heavy intensity')
        weatherSymbol = '<img id="weather-symbol" src="./media/icons/PNG/heavyRain.png" alt="Heavy rain"/>'
        break;
      case 56:
      case 57:
      case 66:
      case 67:
      case 85:
      case 86:
        console.log('Snow + rain')
        weatherSymbol = '<img id="weather-symbol" src="./media/icons/PNG/coldRain.png" alt="Snow and rain"/>'
        break;
      case 71:
      case 73:
      case 75:
      case 77:
        console.log('Snow fall')
        weatherSymbol = '<img id="weather-symbol" src="./media/icons/PNG/snow.png" alt="Snow"/>'
        break;
      case 95:
      case 96:
      case 99:
        console.log('Thunder')
        weatherSymbol = '<svg id="weather-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184.63 153.67"><defs><style>.cls-1{stroke-width:0px;}</style></defs><g id="Lager_1-2"><path class="cls-1" d="m146.15,106c-4.33,0-8.67.17-12.99-.1-1.35-.08-2.62-1.33-3.92-2.05,1.29-.94,2.56-2.65,3.88-2.7,7.65-.25,15.32-.08,22.98-.1,10.7-.02,18.47-4.98,22.03-14.02,3.45-8.73.74-17.99-6.91-25.31-1.31-1.25-2.34-4.22-1.78-5.78,4.97-13.85-5.52-30.18-22.86-28.01-3.11.39-4.74-.58-6.31-3.3-8.18-14.21-20.72-21.19-36.95-19.46-15.96,1.7-26.93,10.75-31.95,26.23-1.31,4.04-2.85,4.93-7.14,3.73-13.91-3.9-27.32,3.66-30.57,17.33-1.01,4.23-2.92,4.65-6.47,4.8-13.61.57-22.42,9.63-22.24,22.49.16,11.51,9.37,20.94,20.92,21.22,6.16.15,12.33-.14,18.49.15,1.59.07,3.1,1.59,4.65,2.45-1.56.8-3.09,2.21-4.67,2.28-6.15.26-12.33.23-18.48.06-13.38-.36-24.89-11.1-25.78-23.89-1.04-14.97,7.8-26.86,22.11-29.05,4.36-.67,6.71-2.07,8.46-6.48,4.85-12.27,18.14-19.19,31.28-16.83,3.22.58,4.56-.13,5.9-3.22C74.55,10.98,86.42,1.83,103.24.23c16.87-1.61,30.13,5.36,39.71,19.2,1.68,2.42,3.2,3.58,6.31,3.56,17.13-.09,28.81,14,25.66,30.97-.52,2.8-.14,4.43,1.84,6.52,7.99,8.42,9.99,18.44,5.53,29.07-4.56,10.87-13.35,16.21-25.15,16.43-3.66.07-7.33.01-10.99.01Z"/><path class="cls-1" d="m120.04,122.3c-7.01,0-13.13.1-19.25-.03-5.25-.11-5.95-1.23-3.91-6.01,4.49-10.55,9.06-21.06,13.6-31.59.2-.46.32-1.05.68-1.32,1.19-.89,2.47-1.66,3.71-2.48.24,1.45,1.07,3.12.61,4.3-2.3,5.87-4.94,11.61-7.44,17.4-1.96,4.53-3.89,9.08-6.29,14.69,5.06,0,9.26-.02,13.47,0,2.66.01,5.32,0,7.97.16,2.77.17,4.04,1.63,2.82,4.34-4.5,9.99-9.02,19.97-13.73,29.86-.48,1-2.26,1.37-3.44,2.04-.29-1.44-1.25-3.15-.78-4.26,3.25-7.64,6.8-15.14,10.24-22.7.53-1.16.94-2.38,1.74-4.41Z"/><path class="cls-1" d="m67.35,105.98c3.83,0,6.64.01,9.45,0,3.29-.02,4.25,1.64,2.98,4.48-3.93,8.79-7.91,17.56-12.07,26.25-.46.97-2.23,1.32-3.39,1.95-.28-1.41-1.19-3.08-.74-4.19,2.19-5.37,4.74-10.6,7.16-15.88,1.02-2.24,2.03-4.48,3.49-7.7-3.45,0-6.17,0-8.88,0-3.47-.01-5.07-1.24-3.43-4.93,2.63-5.92,5.01-11.95,7.78-17.8.52-1.1,2.36-1.58,3.59-2.35.26,1.46,1.11,3.13.67,4.33-1.88,5.1-4.15,10.06-6.6,15.84Z"/></g></svg>'
      default:
        weatherSymbol = `Unknown weather code: ${weatherCode}`
        break;
    }

    console.log(weatherSymbol)

    // Vädersymbolen skickas som svg-kod eller som en png beroende resultatet i switch case.
    weatherSymbolContainer.innerHTML = weatherSymbol

  }

  // document.getElementById('chart-btn').addEventListener("click", showWeatherChart);
  document.getElementById('weather-btn').addEventListener("click", showWeatherReport);
  const chartBtn = document.getElementById('chart-btn');
  const weatherBtn = document.getElementById('weather-btn')
  chartBtn.addEventListener("click", showWeatherChart);
  weatherBtn.style.border = '1px solid #FFF';

  let showWeather1 = document.getElementById('weather-report-container');
  // let showWeather2 = document.getElementById('wind-precipitation-wrapper');
  let addChart = document.getElementById('chart-container');

  function showWeatherChart() {
    showWeather1.style.display = 'none';
    addChart.style.display = 'block';
    chartBtn.style.border = '1px solid #FFF';
    // weatherBtn.style.border = 'none';
    weatherBtn.style.border ='transparent'
  }

  function showWeatherReport() {
    showWeather1.style.display = 'block';
    addChart.style.display = 'none';
    chartBtn.style.border = 'none';
    weatherBtn.style.border = '1px solid #FFF';

  }
