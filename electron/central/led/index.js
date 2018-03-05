var noble = require('noble');
var deviceName = 'microbit'; // TODO change to match your device name

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning(['ff10', '721b']);
        statusDiv.innerHTML += ' Scanning...';
    } else {
        noble.stopScanning();
        alert('Please enable Bluetooth');
    }
});

noble.on('discover', function(peripheral) {
    console.log('Discovered', peripheral.advertisement.localName);
    if (peripheral.advertisement.localName === deviceName) {
        noble.stopScanning();
        connectAndSetUp(peripheral);
    }
});

function connectAndSetUp(peripheral) {
    console.log('Connecting to', peripheral.advertisement.localName);

    peripheral.connect(function(error) {
        console.log('Connecting to', peripheral.advertisement.localName);
        statusDiv.innerHTML = `Connected to '${peripheral.advertisement.localName}'.`

        var serviceUUIDs = ['ff10'];
        var characteristicUUIDs = ['ff11', 'ff12']; // switch, dimmer

        peripheral.discoverSomeServicesAndCharacteristics(
            serviceUUIDs,
            characteristicUUIDs,
            onServicesAndCharacteristicsDiscovered);
    });

    // attach disconnect handler
    peripheral.on('disconnect', onDisconnect);
}

function onDisconnect() {
    console.log('Peripheral disconnected!');
    statusDiv.innerHTML = 'Disconnected.'
}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {

    if (error) {
        console.log('Error discovering services and characteristics ' + error);
        return;
    }

    var switchCharacteristic = characteristics[0];
    var dimmerCharacteristic = characteristics[1];

    function sendData(byte) {
        var buffer = new Buffer(1);
        buffer[0] = byte;
        switchCharacteristic.write(buffer, false, function(error) {
            if (error) {
                console.log(error);
            } else {
                console.log("wrote " + byte);
            }
        });
    }

    function on() {
        sendData(0x01);
    }

    function off() {
        sendData(0x00);
    }

    function setBrightness() {

        if (!dimmerCharacteristic) {
            return;
        }
        var buffer = new Buffer([brightness.value]);

        dimmerCharacteristic.write(buffer, false, function(error) {
            if (error) {
                console.log(error);
            } else {
                console.log('Set brightness to ' + buffer[0]);
            }
        });
    }

    if (dimmerCharacteristic) {
        dimmerCharacteristic.on('data', function(data, isNotification) {
            brightness.value = data.readUInt8(0);
        });
    }

    onButton.addEventListener('click', on, false);
    offButton.addEventListener('click', off, false);
    brightness.addEventListener('change', setBrightness, false);

    if (dimmerCharacteristic) {
        dimmerCharacteristic.read();
    }

}
