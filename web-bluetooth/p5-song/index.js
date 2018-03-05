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
  let buttonServiceUuid = BluetoothUUID.getService(0xFFE0);
  let buttonStatusCharacteristicUuid = BluetoothUUID.getCharacteristic(0xFFE1);
  let combinedUuid = BluetoothUUID.getService(0x721b);
  let sensorTagUuid = BluetoothUUID.getService(0xAA80);
  
  log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice(
    {
      filters: [{services: [sensorTagUuid]}],
      filters: [{services: [combinedUuid]}],
      optionalServices: [buttonServiceUuid]
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
    return server.getPrimaryService(buttonServiceUuid);
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
    log('Argh! ' + error);
  });
}

function buttonStatusCharacteristicChanged(event) {
  // Value is a DataView
  let value = event.target.value;
  let state = value.getUint8(0);
  console.log('Button Status Changed', state);
  if (state) {
    bluetoothKey = state;
    playNote(notes[bluetoothKey]);  
  } else {
    bluetoothKey = -1;
    osc.fade(0,0.5);
  }

}

function disconnect() {
  if (bluetoothDevice && bluetoothDevice.gatt) {
    bluetoothDevice.gatt.disconnect();
  }
  document.querySelector('#startButton').hidden = false;
  document.querySelector('#controlsDiv').hidden = true;
}
