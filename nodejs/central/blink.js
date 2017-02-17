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

  peripheral.connect(function (error) {

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

  function on() {
    sendData(0x01);
    setTimeout(off, 5000);
  }

  function off() {
    sendData(0x00);
    setTimeout(on, 5000);
  }

  on();
}

