// Connect to Thermometer Service 0xBBB0 and subscribe to temperature changes notifications
// Pass the name of the device to this program
// e.g. node temperature-v2 DEVICE_NAME

const noble = require('noble');
// get the device name from command line
const deviceName = process.argv[2];

if (!deviceName) {
  console.warn('WARNING: No device name specified. Will not connect.');
} else {
  console.log(`Looking for a device named ${deviceName}`);
}

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    // 721b is the UUID of the combined peripheral
    noble.startScanning(['bbb0', '721b']);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', peripheral => {
    const name = peripheral.advertisement.localName;
    if (name === deviceName) { 
        console.log(`Connecting to '${name}' ${peripheral.id}`);
        noble.stopScanning();
        connectAndSetUp(peripheral);
    } else {
        console.log(`Skipping '${name}' ${peripheral.id}`);
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
