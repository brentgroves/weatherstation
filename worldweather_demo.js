const unirest = require('unirest');
const fs = require('fs');

async function getCityWeather(city, key) {
  debugger;
  const result = await new Promise(resolve => {
    debugger;
      var req = unirest(
        'GET',
        'https://community-open-weather-map.p.rapidapi.com/weather',
      );

      req.query({
        callback: null,
        id: '2172797',
        //units: '"metric" or "imperial"',
        units:'imperial',
        mode: 'xml, html',
        q: city,
      });

      req.headers({
        'x-rapidapi-host': 'community-open-weather-map.p.rapidapi.com',
        //  'x-rapidapi-key': key,
        //
        'x-rapidapi-key': 'dc59884865msh6226ce75c42da70p1d91dbjsn7f815266c087',
      });

      req.end(function(res) {
          if (res.error){
            throw new Error(res.error)
          } 
        resolve(res);
      });

  });
    
      if (result.status !== 200) {
        throw new Error('API error');
      }
      return result.body;
}
//_"extract useful data"

function unixEpoqToDate(unixDate) {
  const d = new Date(0);
  d.setUTCSeconds(unixDate);
  return d;
}

function extractUsefulData(data) {
  return {
    city: data.name,
    date: new Date(),
    observation_time: unixEpoqToDate(data.dt),
    temperature: data.main.temp,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    weather: data.weather[0].main,
  };
}


const cities = ['London', 'Paris','New York','Moscow','Nouakchott','Ushuaia' ,'Longyearbyen'];


const city_data_map = { };

// a infinite round-robin iterator over the city array
const next_city  = ((arr) => {
   let counter = arr.length;
   return function() {
      counter += 1;
      if (counter>=arr.length) {
        counter = 0;
      }
      return arr[counter];
   };
})(cities);

async function update_city_data(city) {

    try {
        const data  = await getCityWeather(city);
        city_data_map[city] = extractUsefulData(data);
    }
    catch(err) {
        console.log("error city",city , err);
        return ;
    }
}
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

async function displayCityWeather(){
  for(var i=0;i<cities.length;i++){
     const city = next_city();
     console.log("updating city =",city);
      sleep(5000)
      await update_city_data(city);
  }
  console.log(city_data_map)
}
displayCityWeather()

// make a API call every 10 seconds
/*
const interval = 10 * 1000;
setInterval(async () => {
     const city = next_city();
     console.log("updating city =",city);
     await update_city_data(city);
}, interval);
*/

