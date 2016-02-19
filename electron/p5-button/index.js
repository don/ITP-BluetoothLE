var noble = require('noble');

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning(['ffe0']);
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
            if (env && noise) {
                // env and noise are define in drum.js
                env.play(noise);
            }
        } else {
            statusDiv.innerHTML = 'Button is released';
        }
    });

}
