// This example must run on a Raspberry Pi
// Connect to the LED service 0xFF10 and use 
// the button to turn the light on
var Gpio = require('onoff').Gpio,
  button = new Gpio(23, 'in', 'both');

var noble = require('noble');

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    noble.startScanning(['ff10']);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function (peripheral) {
  console.log(peripheral);
  connectAndSetUp(peripheral);
});

function connectAndSetUp(peripheral) {
  console.log('connectAndSetUp');
  peripheral.connect(function (error) {
    console.log('connect');
    var serviceUUIDs = ['ff10'];
    var characteristicUUIDs = ['ff11']; // switchCharacteristic

    peripheral.discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicUUIDs, onServicesAndCharacteristicsDiscovered);
  });

  // attach disconnect handler
  peripheral.on('disconnect', onDisconnect);
}

function onDisconnect() {
  console.log('Peripheral disconnected!');
}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {
  console.log('onServicesAndCharacteristicsDiscovered');
  if (error) {
    console.log('Error discovering services and characteristics ' + error);
    return;
  }

  var switchCharacteristic = characteristics[0];

  function sendData(byte) {
    var buffer = new Buffer(1);
    buffer[0] = byte;
    switchCharacteristic.write(buffer, false, function (error) {
      if (error) {
        console.log(error);
      } else {
        console.log('wrote ' + byte);
      }
    });
  }

  button.watch(function (err, value) {
    console.log('button ' + value);
    sendData(value);
  });

}
