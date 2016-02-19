var noble = require('noble');

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning(['ff10']);
    } else {
        noble.stopScanning();
        alert('Please enable Bluetooth');
    }
});

noble.on('discover', function(peripheral) {
    console.log(peripheral);
    connectAndSetUp(peripheral);
});

function connectAndSetUp(peripheral) {

    peripheral.connect(function(error) {

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
    alert('Peripheral disconnected.');
    console.log('Peripheral disconnected!');
}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {

    if (error) {
        console.log('Error discovering services and characteristics ' + error);
        return;
    }

    var switchCharacteristic = characteristics[0];
    // TODO handle peripherals without ff12
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

        var buffer = new Buffer([brightness.value]);

        dimmerCharacteristic.write(buffer, false, function(error) {
            if (error) {
                console.log(error);
            } else {
                console.log('Set brightness to ' + buffer[0]);
            }
        });
    }

    dimmerCharacteristic.on('data', function(data, isNotification) {
        brightness.value = data.readUInt8(0);
    });

    onButton.addEventListener('click', on, false);
    offButton.addEventListener('click', off, false);
    brightness.addEventListener('change', setBrightness, false);

    if (dimmerCharacteristic) {
        dimmerCharacteristic.read();
    }

}
