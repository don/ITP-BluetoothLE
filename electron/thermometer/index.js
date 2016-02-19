var noble = require('noble');

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning(['bbb0']);
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
