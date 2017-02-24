var noble = require('noble');

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        console.log('Scanning');
        noble.startScanning(['ffe0', 'aa80']);
    } else {
        noble.stopScanning();
        alert('Please enable Bluetooth');
    }
});

noble.on('discover', function(peripheral) {
    console.log('Discovered', peripheral.advertisement.localName);
    // if (peripheral.advertisement.localName === 'Button') {
    connectAndSetUp(peripheral);
    noble.stopScanning();
});

function connectAndSetUp(peripheral) {
    console.log('Connecting to', peripheral.advertisement.localName);

    peripheral.connect(function(error) {
        console.log('Connected to', peripheral.advertisement.localName);

        var serviceUUIDs = ['ffe0'];
        var characteristicUUIDs = ['ffe1']; // button

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

    var buttonCharacteristic = characteristics[0];
    buttonCharacteristic.notify(true);

    buttonCharacteristic.on('data', function(data, isNotification) {
        console.log(data);
        if (data[0] === 1) {
            statusDiv.innerHTML = 'Button is pressed';
        } else {
            statusDiv.innerHTML = 'Button is released';
        }
    });

}
