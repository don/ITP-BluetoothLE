var noble = require('noble');
var peripherals = [];

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        // button service ffe0
        // TI sensor Tag aa80
        // Combined Peripheral 721b
        noble.startScanning(['ffe0', 'aa80', '721b']);
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

        peripherals.push(peripheral.id);
        statusDiv.innerHTML = `Connected to ${peripheral.id} ${peripheral.advertisement.localName}`;

        var serviceUUIDs = ['ffe0'];
        var characteristicUUIDs = ['ffe1']; // button

        peripheral.discoverSomeServicesAndCharacteristics(
            serviceUUIDs,
            characteristicUUIDs,
            onServicesAndCharacteristicsDiscovered);
    });

    peripheral.on('disconnect', () => {
        const message = `${peripheral.advertisement.localName} disconnected.`;
        new Notification('Disconnected', { body: message, silent: true })
        console.log(message);        
    });
}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {

    if (error) {
        console.log('Error discovering services and characteristics ' + error);
        return;
    }

    const buttonCharacteristic = characteristics[0];
    buttonCharacteristic.notify(true);
    const deviceNumber = peripherals.indexOf(buttonCharacteristic._peripheralId);

    buttonCharacteristic.on('data', function(data, isNotification) {
        console.log(`Device: ${deviceNumber} buttonValue: ${data[0]}`);
        if (data[0] > 0) {
            statusDiv.innerText = `Device ${deviceNumber} button ${data[0]} is pressed`;
            // each device has 2 keys
            bluetoothKey = data[0] + deviceNumber * 2;
        } else {
            bluetoothKey = -1;
            statusDiv.innerText = '';
            osc.fade(0,0.5);
        }

        playNote(notes[bluetoothKey]);
    });

}
