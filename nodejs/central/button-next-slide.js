// Attach to a button peripheral 0xFFE0 and 
// subscribe for button status notifications
// Send right arrow key when button is pressed
// Can be used to advance a powerpoint deck to next slide
// Example based on https://github.com/MakeBluetooth/sensor-tag-remote
var noble = require('noble');
var robot = require('robotjs');

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
  console.log(buttonStatusCharacteristic);

  buttonStatusCharacteristic.on('data', function (data, isNotification) {
    if (data.length === 1) {
      var result = data.readUInt8(0);
      if (result) { // result !== 0
        console.log('Robotjs is pressing the right arrow key');
        robot.keyTap('right');  // send the arrow key
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

