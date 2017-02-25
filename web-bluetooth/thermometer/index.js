document.querySelector('#startButton').addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (isWebBluetoothEnabled()) {
        ChromeSamples.clearLog();
        onStartButtonClick();
    }
});

var bluetoothDevice;
var temperatureCharacteristic;
var log = ChromeSamples.log;

document.querySelector('#controlsDiv').hidden = true;
document.querySelector('#disconnectButton').addEventListener('click', disconnect);

function onStartButtonClick() {
  let serviceUuid = BluetoothUUID.getService(0xBBB0);
  let temperatureCharacteristicUuid = BluetoothUUID.getCharacteristic(0xBBB1);

  log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice(
    {
      filters: [{services: [serviceUuid]}]
    }
  ).then(device => {
    bluetoothDevice = device; // save a copy
    document.querySelector('#startButton').hidden = true;
    document.querySelector('#controlsDiv').hidden = false;
    log('Connecting to GATT Server...');
    return device.gatt.connect();
  })
  .then(server => {
    log('Getting Service...');
    return server.getPrimaryService(serviceUuid);
  })
  .then(service => {
    log('Getting Characteristic...');
    return service.getCharacteristics();
  })
  .then(characteristics => {

    // save references to the characteristics we care about
    characteristics.forEach(c => {

      switch(c.uuid) {        
        case temperatureCharacteristicUuid:
          log('Temperature Status Characteristic');
          temperatureCharacteristic = c;
          temperatureCharacteristic.startNotifications().then(_ => {
            log('Temperature Status Notifications started');
            temperatureCharacteristic.addEventListener('characteristicvaluechanged', temperatureCharateristicChanged);
          });
          temperatureCharacteristic.readValue().then(updateTemperature);
          break;
        
        default:
          log('Skipping ' + c.uuid);
      }
    });
  })
  .catch(error => {
    log('Argh! ' + error);
  });
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
