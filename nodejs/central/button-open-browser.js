// Attach to a button peripheral 0xFFE0 and subscribe for button status notifications
const noble = require('noble');
const opn = require('opn');

const BUTTON_SERVICE_UUID = 'ffe0';
const BUTTON_STATUS_CHARACTERISTIC_UUID = 'ffe1';
const COMBINED_UUID = '721b';
const SENSOR_TAG_UUID = 'aa80';

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    console.log('Bluetooth is on. Starting Scan.');
    noble.startScanning([BUTTON_SERVICE_UUID, COMBINED_UUID, SENSOR_TAG_UUID]);
  } else {
    noble.stopScanning();
    console.log('Bluetooth is off. Stopped Scan.');
  }
});

noble.on('discover', peripheral => {
  const name = peripheral.advertisement.localName;
  if (name === 'CC2650 SensorTag') { // change to match name of your device
    console.log(`Connecting to '${name}' ${peripheral.id}`);
    connectAndSetUp(peripheral);
    noble.stopScanning();
  } else {
    console.log(`Skipping '${name}' ${peripheral.id}`);
  }
});

function connectAndSetUp(peripheral) {

  peripheral.connect(function (error) {
    console.log('Discovering services & characteristics');
    const serviceUUIDs = [BUTTON_SERVICE_UUID];
    const characteristicUUIDs = [BUTTON_STATUS_CHARACTERISTIC_UUID];
    peripheral.discoverSomeServicesAndCharacteristics(
        serviceUUIDs,
        characteristicUUIDs,
        onServicesAndCharacteristicsDiscovered
    );
  });

  peripheral.on('disconnect', () => console.log('disconnected'));
}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {

  if (error) {
    console.log('Error discovering services and characteristics ' + error);
    return;
  }

  const buttonStatusCharacteristic = characteristics[0];

  buttonStatusCharacteristic.on('data', (data, isNotification) => {
    // if the first byte of data is non-zero
    if (data.length > 0 && data.readUInt8(0)) {
      opn('https://nodejs.org');
    }
  });

  buttonStatusCharacteristic.subscribe((err) => {
    if (err) {
      console.log('Error subscribing to button notifications', err);
    } else {
      console.log('Subscribed for button notifications');
    }
  });
}
