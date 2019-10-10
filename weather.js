/*global require,console,setInterval */
Error.stackTraceLimit = Infinity;

_"making a round robin read"

const opcua = require("node-opcua");

function construct_my_address_space(server) {
    // declare some folders
    const addressSpace = server.engine.addressSpace;
    const namespace = addressSpace.getOwnNamespace();
    const objectsFolder = addressSpace.rootFolder.objects;

    const citiesNode  = namespace.addFolder(objectsFolder,{ browseName: "Cities"});

    for (let city_name of cities) {
        // declare the city node
        const cityNode = namespace.addFolder(citiesNode,{ browseName: city_name });
        _"construct city weather variables"
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

    }
    catch(err) {
       console.log("Error = ",err);
    }
})();
