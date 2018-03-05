var noble = require('noble');
var deviceName = 'microbit';  // TODO change to match your device name

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning(['bbb0', '721b']);
    } else {
        noble.stopScanning();
        alert('Please enable Bluetooth');
    }
});

noble.on('discover', function(peripheral) {
    console.log('Discovered', peripheral.advertisement.localName);
    if (peripheral.advertisement.localName === deviceName) {
        console.log(peripheral);
        connectAndSetUp(peripheral);
    }
});

function connectAndSetUp(peripheral) {
    console.log('Connecting to', peripheral.advertisement.localName);

    peripheral.connect(function(error) {
        console.log('Connected to', peripheral.advertisement.localName);

        var serviceUUIDs = ['bbb0'];
        var characteristicUUIDs = ['bbb1']; // temperature

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

    var temperatureCharacteristic = characteristics[0];
    temperatureCharacteristic.notify(true);
    temperatureCharacteristic.read();

    temperatureCharacteristic.on('data', function(data, isNotification) {
        console.log(data);
        statusDiv.innerHTML = data.readFloatLE().toFixed(1) + '&deg;C';
    });

}
