// Connect to the LED service 0xFF10 and use 
// the keyboard as buttons to turn the light on and off
var noble = require('noble');
var keypress = require('keypress');

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
  }

  function off() {
    sendData(0x00);
  }

  keypress(process.stdin);
  process.stdin.on('keypress', function (ch, key) {
    console.log('got "keypress"', ch, JSON.stringify(key));

    if (key && key.ctrl && key.name == 'c') {
      process.exit();
    }

    // number keys don't have names O_o
    if (ch === '1') {
      on();
    } else if (ch == '0') {
      off();
    }

    // other keys have names
    if (key && key.name == 'w') {
      on();
    } else if (key && key.name == 's') {
      off();
    }

  });
  process.stdin.setRawMode(true);
  process.stdin.resume();

}

