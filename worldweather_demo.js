const unirest = require('unirest');
const fs = require('fs');
const cities = ['London', 'Paris','New York','Moscow','Ho chi min','Benjing','Reykjavik' ,'Nouakchott','Ushuaia' ,'Longyearbyen'];

//_"accessing the openweathermap API key"

function extractUsefulData(data) {

  return {
    city: 'test'
  };
}
async function getCityWeather(city, key) {
  debugger;
  const result = await new Promise(resolve => {
    debugger;
    try {
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
        q: 'London,uk',
      });

      req.headers({
        'x-rapidapi-host': 'community-open-weather-map.p.rapidapi.com',
        //  'x-rapidapi-key': key,
        //
        'x-rapidapi-key': 'dc59884865msh6226ce75c42da70p1d91dbjsn7f815266c087',
      });

      req.end(function(res) {
        if (res.error) throw new Error(res.error);

      //  console.log(res.body);
        resolve(res);
      });

    } catch (err) {
      console.log('Error = ', err);
    }

  });
    
      if (result.status !== 200) {
        throw new Error('API error');
      }
      return result.body;
}
//_"extract useful data"
async function getTemp(){

var weather= await getCityWeather('t','1');
    console.log(weather.main)
    console.log(weather.main.temp)

}


getTemp();


/*
function unixEpoqToDate(unixDate) {
  const d = new Date(0);
  d.setUTCSeconds(unixDate);
  return d;
}

function extractUsefulData(data) {
  return {
    city: data.city,
    date: new Date(),
    observation_time: unixEpoqToDate(data.dt),
    temperature: data.main.temp,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    weather: data.weather[0].main,
  };
}
*/
