// Attach to a button peripheral 0xFFE0 and subscribe for button status notifications
const noble = require('noble');

const BUTTON_SERVICE_UUID = 'ffe0';
const BUTTON_STATUS_CHARACTERISTIC_UUID = 'ffe1';
const COMBINED_UUID = '721b';
const SENSOR_TAG_UUID = 'aa80';

// get the device name from command line
const deviceName = process.argv[2];

if (!deviceName) {
  console.warn('WARNING: No device name specified. Will not connect.');
} else {
  console.log(`Looking for a device named ${deviceName}`);
}

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
  if (name === deviceName) { 
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
    if (data.length > 0) {
      const buttonState = data.readUInt8(0);
      if (buttonState) { // buttonState != 0
        console.log('Button is pressed');
      } else {
        console.log('Button is released');
      }
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
