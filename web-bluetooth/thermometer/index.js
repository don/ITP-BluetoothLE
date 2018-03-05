document.querySelector('#startButton').addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (isWebBluetoothEnabled()) {
        ChromeSamples.clearLog();
        onStartButtonClick();
    }
});

let bluetoothDevice;
let temperatureCharacteristic;
const log = ChromeSamples.log;

document.querySelector('#controlsDiv').hidden = true;
document.querySelector('#disconnectButton').addEventListener('click', disconnect);

async function onStartButtonClick() {
  let thermometerServiceUuid = BluetoothUUID.getService(0xBBB0);
  let temperatureCharacteristicUuid = BluetoothUUID.getCharacteristic(0xBBB1);
  let combinedUuid = BluetoothUUID.getService(0x721b);

  try {
    log('Requesting Bluetooth Device...');
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [
        {services: [combinedUuid]},
        {services: [thermometerServiceUuid]}
      ],
      optionalServices: [thermometerServiceUuid]
    });

    document.querySelector('#startButton').hidden = true;
    document.querySelector('#controlsDiv').hidden = false;
    
    log('Connecting to GATT Server...');
    const server = await bluetoothDevice.gatt.connect();

    log('Getting Service...');
    const service = await server.getPrimaryService(thermometerServiceUuid);

    log('Getting Characteristic...');
    temperatureCharacteristic = await service.getCharacteristic(temperatureCharacteristicUuid);
    await temperatureCharacteristic.startNotifications();

    log('> Notifications started');
    temperatureCharacteristic.addEventListener('characteristicvaluechanged', temperatureCharateristicChanged);

    // temperatureCharacteristic.readValue().then(updateTemperature);
    log('> Reading initial value');
    const temperature = await temperatureCharacteristic.readValue();
    updateTemperature(temperature);

  } catch (error) {
    log('Error: ' + error);
  }
}

function updateTemperature(value) {
  // expecting DataView with float32 (little endian) in degress C
  let celsius = value.getFloat32(0, true);
  let fahrenheit = (celsius * 1.8 + 32.0).toFixed(1);
  let message = 'Temperature is ' + fahrenheit + ' &deg;F ' + celsius.toFixed(1) + ' &deg;C';
  statusDiv.innerHTML = message;
}

function temperatureCharateristicChanged(event) {
  let value = event.target.value;
  updateTemperature(value);
}

function disconnect() {
  if (bluetoothDevice && bluetoothDevice.gatt) {
    bluetoothDevice.gatt.disconnect();
  }
  document.querySelector('#startButton').hidden = false;
  document.querySelector('#controlsDiv').hidden = true;
}
