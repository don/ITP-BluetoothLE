// Connect to Thermometer Service 0xBBB0 and subscribe to temperature changes notifications
// This code uses term-list to show a list of discovered devices
// Use arrows to move and the enter key to select the device
const noble = require('noble');
const List = require('term-list');
var list = new List();
list.start();

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    // 721b is the UUID of the combined peripheral
    noble.startScanning(['bbb0', '721b']);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', peripheral => {
    const name = peripheral.advertisement.localName || 'unknown';
    const label = `${name.padEnd(16)} ${peripheral.id}\t${peripheral.rssi}`;
    list.add(peripheral, label);
    list.draw();
});

list.on('keypress', function(key, item){
  switch (key.name) {
    case 'return':
      console.log(`connecting to ${item.id}`);
      noble.stopScanning();
      connectAndSetUp(item);
      break;
    case 'c':
      if (key.ctrl) {
        list.stop();
        process.exit();
      }
      break;
  }
});

function connectAndSetUp(peripheral) {

  peripheral.connect(error => {
    const serviceUUIDs = ['bbb0'];
    const characteristicUUIDs = ['bbb1'];

    peripheral.discoverSomeServicesAndCharacteristics(
        serviceUUIDs,
        characteristicUUIDs,
        onServicesAndCharacteristicsDiscovered
    );
  });

}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {

  const temperatureCharacteristic = characteristics[0];

  temperatureCharacteristic.on('data', (data, isNotification) => {
    const celsius = data.readFloatLE(0);
    const fahrenheit = (celsius * 1.8 + 32.0).toFixed(1);
    console.log('Temperature is', celsius.toFixed(1) + '°C', fahrenheit + '°F');
  });

  temperatureCharacteristic.read();      // ignore callback
  temperatureCharacteristic.subscribe(); // ignore callback
}
