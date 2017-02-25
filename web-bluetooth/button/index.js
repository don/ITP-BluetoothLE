document.querySelector('#startButton').addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (isWebBluetoothEnabled()) {
        ChromeSamples.clearLog();
        onStartButtonClick();
    }
});

var bluetoothDevice;
var buttonStatusCharacteristic;
var log = ChromeSamples.log;

document.querySelector('#controlsDiv').hidden = true;
document.querySelector('#disconnectButton').addEventListener('click', disconnect);

function onStartButtonClick() {
  let serviceUuid = BluetoothUUID.getService(0xFFE0);
  let buttonStatusCharacteristicUuid = BluetoothUUID.getCharacteristic(0xFFE1);
  
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
        case buttonStatusCharacteristicUuid:
          log('Button Status Characteristic');
          buttonStatusCharacteristic = c;
          buttonStatusCharacteristic.startNotifications().then(_ => {
            log('Button Status Notifications started');
            buttonStatusCharacteristic.addEventListener('characteristicvaluechanged', buttonStatusCharacteristicChanged);
          });
          break;
        
        default:
          log('Skipping ' + c.uuid);
      }
    });
  })
  .catch(error => {
    log('Error! ' + error);
  });
}

function buttonStatusCharacteristicChanged(event) {
  // Value is a DataView
  let value = event.target.value;
  let state = value.getUint8(0);
  console.log('Button Status Changed', state);
  if (state) {
    statusDiv.innerText = 'Button is pressed.';            
  } else {
    statusDiv.innerText = 'Button is released.';
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