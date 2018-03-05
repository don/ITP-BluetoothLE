document.querySelector('#startButton').addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (isWebBluetoothEnabled()) {
        ChromeSamples.clearLog();
        onStartButtonClick();
    }
});

let bluetoothDevice;
let powerSwitchCharateristic;
let brightnessCharacteristic;
const log = ChromeSamples.log;

document.querySelector('#controlsDiv').hidden = true;

document.querySelector('#brightness').addEventListener('change', onBrightnessChange);
document.querySelector('#powerswitch').addEventListener('click', onPowerSwitchChange);
document.querySelector('#disconnectButton').addEventListener('click', disconnect);

function onBrightnessChange(event) { 
  let brightness = event.target.value;
  brightnessCharacteristic.writeValue(new Uint8Array([brightness]));
  // Sync the UI (notification from peripheral would be better)
  if (brightness === "0") { 
    powerswitch.checked = false; 
  } else if (!powerswitch.checked) {
    powerswitch.checked = true;
  }
}

function onPowerSwitchChange(event) {
  let checked = event.target.checked;

  if (checked) {
    powerSwitchCharateristic.writeValue(new Uint8Array([1]));
  } else {
    powerSwitchCharateristic.writeValue(new Uint8Array([0]));
  }
}

async function onStartButtonClick() {
  const combinedUuid = BluetoothUUID.getCharacteristic(0x721b);
  const ledServiceUuid = BluetoothUUID.getCharacteristic(0xFF10);
  const powerSwitchCharateristicUuid = BluetoothUUID.getCharacteristic(0xFF11);
  const brightnessCharacteristicUuid = BluetoothUUID.getCharacteristic(0xFF12);
  
  log('Requesting Bluetooth Device...');
  bluetoothDevice = await navigator.bluetooth.requestDevice({
    filters: [
      {services: [ledServiceUuid]}, 
      {services: [combinedUuid]}
    ]
  });

  log('Connecting to GATT Server...');
  const server = await bluetoothDevice.gatt.connect();

  log('Getting Service...');
  const service = await server.getPrimaryService(ledServiceUuid);

  document.querySelector('#startButton').hidden = true;
  document.querySelector('#controlsDiv').hidden = false;

  log('Getting Characteristics...');
  powerSwitchCharateristic = await service.getCharacteristic(powerSwitchCharateristicUuid);
  powerSwitchCharateristic.readValue().then(updatePowerSwitch);

  try {
    brightnessCharacteristic = await service.getCharacteristic(brightnessCharacteristicUuid);
    brightnessCharacteristic.readValue().then(updateBrightnessSlider);
    // show the brightness control and label
    brightness.hidden = false;
    brightness.labels[0].style.display = '';
  } catch (e) { // doesn't support 0xff12
    log(e);
    brightness.hidden = true;
    brightness.labels[0].style.display = 'none';
  }

}

function updateBrightnessSlider(value) {
  document.querySelector('#brightness').value = value.getUint8(0);
}

function updatePowerSwitch(value) {
  // expecting DataView with uint8: 1 for on, 0 for off
  document.querySelector('#powerswitch').checked = value.getUint8(0);
}

function powerSwitchCharacteristicChanged(event) {
  let value = event.target.value;
  console.log('Power Switch Value Changed', value.getUint8(0));
  updatePowerSwitch(value);
}

function disconnect() {
  if (bluetoothDevice && bluetoothDevice.gatt) {
    bluetoothDevice.gatt.disconnect();
  }
  document.querySelector('#startButton').hidden = false;
  document.querySelector('#controlsDiv').hidden = true;
}
