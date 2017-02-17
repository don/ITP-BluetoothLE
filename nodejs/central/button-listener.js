// Attach to a button peripheral 0xFFE0 and 
// subscribe for button status notifications
// Log button presses to the console
var noble = require('noble');

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    noble.startScanning(['ffe0']);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function (peripheral) {
  console.log(peripheral);
  connectAndSetUp(peripheral);
});

function connectAndSetUp(peripheral) {

  peripheral.connect(function (error) {

    var serviceUUIDs = ['ffe0'];
    var characteristicUUIDs = ['ffe1']; // buttonStatus characteristic

    peripheral.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, onServicesAndCharacteristicsDiscovered);
  });

  // attach disconnect handler
  peripheral.on('disconnect', onDisconnect);
}

function onDisconnect() {
  console.log('Peripheral disconnected!');
}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {

  if (error) {
    console.log('Error discovering services and characteristics ' + error);
    return;
  }

  var buttonStatusCharacteristic = characteristics[0];

  buttonStatusCharacteristic.on('data', function (data, isNotification) {
    if (data.length === 1) {
      // read one byte from the buffer
      var result = data.readUInt8(0);
      if (result) { // result !== 0
        console.log('Button is pressed');
      } else {
        console.log('Button is released');
      }
    } else {
      console.log('Data length is incorrect. Expecting 1 byte got', data.length);
    }
  });
  buttonStatusCharacteristic.subscribe(function (err) {
    if (err) {
      console.log('Error subscribing to button notifications', err);
    } else {
      console.log('Subscribed for button notifications');
    }
  });

}

