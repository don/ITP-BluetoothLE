// Connect to Thermometer Service 0xBBB0
// and display notification for temperature changes
var noble = require('noble');

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    noble.startScanning(['bbb0', 'B6FD7210-32D4-4427-ACA7-99DF89E10380']);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function (peripheral) {
  console.log('Discovered', peripheral.advertisement.localName, peripheral.address);
  connectAndSetUp(peripheral);
  // TODO should stop scanning otherwise we connect to ALL the thermometers
});

function connectAndSetUp(peripheral) {

  peripheral.connect(function (error) {
    var serviceUUIDs = ['bbb0'];
    var characteristicUUIDs = ['bbb1'];

    peripheral.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, onServicesAndCharacteristicsDiscovered);
  });

}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {

  var temperatureCharacteristic = characteristics[0];

  temperatureCharacteristic.on('data', function (data, isNotification) {
    var celsius = data.readFloatLE(0);
    var fahrenheit = (celsius * 1.8 + 32.0).toFixed(1);
    console.log('Temperature is', celsius.toFixed(1) + '°C', fahrenheit + '°F');
  });

  temperatureCharacteristic.subscribe(); // ignore callback
  temperatureCharacteristic.read();      // ignore callback
}

