// Connect to the LED service 0xFF10 and use
// the keyboard as buttons to turn the light on and off
const noble = require('noble');
const keypress = require('keypress');

const LED_SERVICE_UUID = 'ff10';
const SWITCH_CHARACTERISTIC_UUID = 'ff11';
const DIMMER_CHARACTERISTIC_UUID = 'ff12';
const COMBINED_UUID = '721b';

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    console.log('Bluetooth is on. Starting Scan.');
    noble.startScanning([LED_SERVICE_UUID, COMBINED_UUID]);
  } else {
    noble.stopScanning();
    console.log('Bluetooth is off. Stopped Scan.');
  }
});

noble.on('discover', peripheral => {
  const name = peripheral.advertisement.localName;
  if (name === 'LED') { // change to match name of your device
    console.log(`Connecting to '${name}' ${peripheral.id}`);
    connectAndSetUp(peripheral);
    noble.stopScanning();
  } else {
    console.log(`Skipping '${name}' ${peripheral.id}`);
  }
});

function connectAndSetUp(peripheral) {

  peripheral.connect(function (error) {

    const serviceUUIDs = [LED_SERVICE_UUID];
    const characteristicUUIDs = [SWITCH_CHARACTERISTIC_UUID, DIMMER_CHARACTERISTIC_UUID];

    peripheral.discoverSomeServicesAndCharacteristics(
        serviceUUIDs,
        characteristicUUIDs,
        onServicesAndCharacteristicsDiscovered);
  });

  peripheral.on('disconnect', () => console.log('disconnected'));
}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {

  if (error) {
    console.log('Error discovering services and characteristics ' + error);
    return;
  }

  const switchCharacteristic = characteristics[0];
  const dimmerCharacteristic = characteristics[1];

  let brightness = 0xFF;
  const BRIGHTNESS_INCREMENT = 51;
  const MAX_BRIGHTNESS = 0xFF;
  const MIN_BRIGHTNESS = 0x00;

  function sendData(byte) {
    const buffer = new Buffer(1);
    buffer[0] = byte;
    switchCharacteristic.write(buffer, false, function (error) {
      if (error) {
        console.log(error);
      } else {
        console.log('wrote ' + byte);
      }
    });
  }

  // TODO this should to handle when dimmer characteristic is missing
  function sendBrightness(byte) {
    var buffer = new Buffer([byte]);
    dimmerCharacteristic.write(buffer, false, function (error) {
      if (error) {
        console.log(error);
      } else {
        console.log('Set brightness to ' + byte);
      }
    });
  }

  function on() {
    sendData(0x01);
  }

  function off() {
    sendData(0x00);
  }

  function increaseBrightness() {
    brightness += BRIGHTNESS_INCREMENT;
    if (brightness > MAX_BRIGHTNESS) {
      brightness = MAX_BRIGHTNESS;
    }
    sendBrightness(brightness);
  }

  function decreaseBrightness() {
    brightness -= BRIGHTNESS_INCREMENT;
    if (brightness < MIN_BRIGHTNESS) {
      brightness = MIN_BRIGHTNESS;
    }
    sendBrightness(brightness);
  }

  keypress(process.stdin);
  process.stdin.on('keypress', function (ch, key) {
    console.log('got "keypress"', ch, JSON.stringify(key));

    if (key && key.ctrl && key.name == 'c') {
      process.exit();
    }

    const keyname = key && key.name;
    if (keyname === 'w') {
      on();
    } else if (keyname === 's') {
      off();
    } else if (keyname === 'a') {
      decreaseBrightness();
    } else if (keyname === 'd') {
      increaseBrightness();
    }
  });
  process.stdin.setRawMode(true);
  process.stdin.resume();

}
