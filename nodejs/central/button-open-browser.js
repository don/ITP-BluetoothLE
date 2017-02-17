// Attach to a button peripheral 0xFFE0 and 
// subscribe for button status notifications
// Open a URL when a button is pressed
var noble = require('noble');
var opn = require('opn');

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
    console.log('Received notification!'); // read and notify work the same
    if (data.length === 1) {
      var result = data.readUInt8(0);
      if (result === 1) {
        opn('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      }
    } else {
      console.log('result length incorrect');
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

