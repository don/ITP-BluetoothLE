// https://googlechrome.github.io/samples/web-bluetooth/discover-services-and-characteristics.html

document.querySelector('#startButton').addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (isWebBluetoothEnabled()) {
        ChromeSamples.clearLog();
        onStartButtonClick();
    }
});

var bluetoothDevice;
var log = function(message) {
  ChromeSamples.log(message);
  var text = document.createTextNode(message);
  var br = document.createElement('br');
  var div = document.querySelector('#statusDiv');
  div.appendChild(text)
  div.appendChild(br);
}

document.querySelector('#controlsDiv').hidden = true;
document.querySelector('#disconnectButton').addEventListener('click', disconnect);

function onStartButtonClick() {
  document.querySelector('#statusDiv').innerHTML = '';
  log('Requesting Bluetooth Device...');
  // NOTE: Can't make a generic scanner since need to specific services
  // when scanning. Specify additional services here.
  navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: [0xFF10, 0xFFE0, 0xBBB0, 0xCCC0]
    })
  .then(device => {
    bluetoothDevice = device; // save a copy
    document.querySelector('#startButton').hidden = true;
    document.querySelector('#controlsDiv').hidden = false;
    log('Connecting to GATT Server...');
    return device.gatt.connect();
  })
  .then(server => {
      log('Getting Service...');
      return server.getPrimaryServices();
  })
  .then(services => {
    log('Getting Characteristics...');
    let queue = Promise.resolve();
    services.forEach(service => {
      queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
        log('> Service: ' + service.uuid);
        characteristics.forEach(characteristic => {
          log('>> Characteristic: ' + characteristic.uuid + ' ' +
              getSupportedProperties(characteristic));
        });
      }));
    });
    return queue;
  })
  .catch(error => {
    log('Error: ' + error);
  });
}

function disconnect() {
  if (bluetoothDevice && bluetoothDevice.gatt) {
    bluetoothDevice.gatt.disconnect();
  }
  document.querySelector('#startButton').hidden = false;
  document.querySelector('#controlsDiv').hidden = true;
}

/* Utils */
function getSupportedProperties(characteristic) {
  let supportedProperties = [];
  for (const p in characteristic.properties) {
    if (characteristic.properties[p] === true) {
      supportedProperties.push(p.toUpperCase());
    }
  }
  return '[' + supportedProperties.join(', ') + ']';
}