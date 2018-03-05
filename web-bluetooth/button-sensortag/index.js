document.querySelector('#startButton').addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (isWebBluetoothEnabled()) {
        ChromeSamples.clearLog();
        onStartButtonClick();
    }
});

let bluetoothDevice;
let buttonStatusCharacteristic;
const log = ChromeSamples.log;

document.querySelector('#controlsDiv').hidden = true;
document.querySelector('#disconnectButton').addEventListener('click', disconnect);

async function onStartButtonClick() {
  let buttonServiceUuid = BluetoothUUID.getService(0xFFE0);
  let buttonStatusCharacteristicUuid = BluetoothUUID.getCharacteristic(0xFFE1);
  let combinedUuid = BluetoothUUID.getService(0x721b);
  let sensorTagUuid = BluetoothUUID.getService(0xAA80);
  
  try {
    log('Requesting Bluetooth Device...');
    bluetoothDevice = await navigator.bluetooth.requestDevice(
      {
        filters: [
          {services: [combinedUuid]},
          {services: [sensorTagUuid]}
        ],
        optionalServices: [buttonServiceUuid]
      }
    );

    document.querySelector('#startButton').hidden = true;
    document.querySelector('#controlsDiv').hidden = false;

    log('Connecting to GATT Server...');
    const server = await bluetoothDevice.gatt.connect();

    log('Getting Service...');
    const service = await server.getPrimaryService(buttonServiceUuid);

    log('Getting Characteristic...');
    buttonStatusCharacteristic = await service.getCharacteristic(buttonStatusCharacteristicUuid);
    await buttonStatusCharacteristic.startNotifications();

    log('> Notifications started');
    buttonStatusCharacteristic.addEventListener('characteristicvaluechanged', buttonStatusCharacteristicChanged);
  } catch (error) {
    log('Error: ' + error);
  }
}

function buttonStatusCharacteristicChanged(event) {
  // Value is a DataView
  let value = event.target.value;
  let state = value.getUint8(0);
  console.log('Button Status Changed', state);

  // TI Sensor Tag uses a bit mask
  var LEFT_BUTTON = 1;  // 0001
  var RIGHT_BUTTON = 2; // 0010
  var REED_SWITCH = 4;  // 0100

  var message = '';

  if (state === 0) {
      message = 'No buttons are pressed.';
  }

  if (state & LEFT_BUTTON) {
      message += 'Left button is pressed.<br/>';
  }

  if (state & RIGHT_BUTTON) {
      message += 'Right button is pressed.<br/>';
  }

  if (state & REED_SWITCH) {
      message += 'Reed switch is activated.<br/>';
  }

  statusDiv.innerHTML = message;

}

function disconnect() {
  if (bluetoothDevice && bluetoothDevice.gatt) {
    bluetoothDevice.gatt.disconnect();
  }
  document.querySelector('#startButton').hidden = false;
  document.querySelector('#controlsDiv').hidden = true;
}
