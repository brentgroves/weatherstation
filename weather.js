/*global require,console,setInterval */
Error.stackTraceLimit = Infinity;

/*global require,setInterval,console */

// var endpointUrl = "opc.tcp://brent-desktop:4334";

const cities = ['London', 'Paris','New York','Moscow','Nouakchott','Ushuaia' ,'Longyearbyen'];
const fs = require("fs");
const unirest = require("unirest");

var key = fs.readFileSync("openweathermap.key","utf-8");
var key=key.trim();

async function getCityWeather(city) {
  const result = await new Promise(resolve => {
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
        'x-rapidapi-key': key,
        //
        //'x-rapidapi-key': 'dc59884865msh6226ce75c42da70p1d91dbjsn7f815266c087',
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

/*
async function getCityWeather(city) {
debugger;
    const result = await new Promise((resolve) => {
        unirest.get(
            "https://community-open-weather-map.p.rapidapi.com/weather?id=2172797"
            + "&units=metric"
            + "&mode=json"
            + `&q=${city}`)
        .header("X-RapidAPI-Host", "community-open-weather-map.p.rapidapi.com")
        .header("X-RapidAPI-Key", key)
        .end(
            (response) => resolve(response)
        );
    });
    if (result.status !== 200) {
        debugger;
        throw new Error("API error");
    }
    debugger;
    return result.body;
}
*/


function unixEpoqToDate(unixDate) {
    const d = new Date(0);
    d.setUTCSeconds(unixDate);
    return d;
}

function extractUsefulData(data) {
    return  {
        city:               data.name,
        date:               new Date(),
        observation_time:   unixEpoqToDate(data.dt),
        temperature:        data.main.temp,
        humidity:           data.main.humidity,
        pressure:           data.main.pressure,
        weather:            data.weather[0].main
    };
}

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


const opcua = require("node-opcua");


function construct_my_address_space(server) {
    // declare some folders
    debugger;
    const addressSpace = server.engine.addressSpace;
    const namespace = addressSpace.getOwnNamespace();
    const objectsFolder = addressSpace.rootFolder.objects;

    const citiesNode  = namespace.addFolder(objectsFolder,{ browseName: "Cities"});

    for (let city_name of cities) {
        // declare the city node
        const cityNode = namespace.addFolder(citiesNode,{ browseName: city_name });
        namespace.addVariable({
            componentOf: cityNode,
            browseName: "Temperature",
            nodeId: `s=${city_name}-Temperature`,
            dataType: "Double",
            value: {  get: function () { return extract_value(opcua.DataType.Double, city_name,"temperature"); } }
        });
        namespace.addVariable({
            componentOf: cityNode,
            nodeId: `s=${city_name}-Humidity`,
            browseName: "Humidity",
            dataType: "Double",
            value: {  get: function () { return extract_value(opcua.DataType.Double,city_name,"humidity"); } }
        });
        namespace.addVariable({
            componentOf: cityNode,
            nodeId: `s=${city_name}-Pressure`,
            browseName: "Pressure",
            dataType: "Double",
            value: {  get: function () { return extract_value(opcua.DataType.Double,city_name,"pressure"); } }
        });
        namespace.addVariable({
            componentOf: cityNode,
            nodeId: `s=${city_name}-Weather`,
            browseName: "Weather",
            dataType: "String",
            value: {  get: function () { return extract_value(opcua.DataType.String,city_name,"weather"); } }
        });
    }
}
function extract_value(dataType,city_name,property) {
    const city = city_data_map[city_name];
    if (!city) {
        return opcua.StatusCodes.BadDataUnavailable
    }

    const value = city[property];
    return new opcua.Variant({dataType, value: value });
}

(async () => {

    try {
      
      const server = new opcua.OPCUAServer({
         port: 4334, // the port of the listening socket of the servery
         buildInfo: {
           productName: "WeatherStation",
           buildNumber: "7658",
           buildDate: new Date(2019,6,14),
         }
      });
      
      
      await server.initialize();
      construct_my_address_space(server);
      await server.start();
      console.log("Server is now listening ... ( press CTRL+C to stop)");
      console.log("port ", server.endpoints[0].port);
      const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
      console.log(" the primary server endpoint url is ", endpointUrl );
      debugger; 
    }
    catch(err) {
       console.log("Error = ",err);
    }
})();


function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

//make a API call every 10 seconds

const interval = 10 * 1000;
setInterval(async () => {
     const city = next_city();
     console.log("updating city =",city);
     await update_city_data(city);
     console.log(city_data_map[city]);
}, interval);
