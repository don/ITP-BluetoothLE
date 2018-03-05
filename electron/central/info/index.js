var noble = require('noble');
var Handlebars = require('handlebars');

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning([]);
    } else {
        noble.stopScanning();
        alert('Please enable Bluetooth');
    }
});

noble.on('discover', function(peripheral) {
    console.log(peripheral);

    // if (!peripheral.advertisement.localName) { return; }

    var source = document.querySelector('#list-item-template').innerText;
    var template = Handlebars.compile(source);
    var listItem = template(peripheral);
    deviceList.insertAdjacentHTML('beforeend', listItem);
});

var formatId = function(id) {
    if (id.length < 32) {
        // not a uuid, just return what we got        
        return id;
    }
    var formatted = id.slice(0,8) + '-' +
        id.slice(8,12) + '-' +
        id.slice(12,16) + '-' +
        id.slice(16,20) + '-' +
        id.slice(20);
    return formatted;
}

var detailsTemplate = Handlebars.compile(document.getElementById('details-template').innerText);

var connect = function(e) { // handles the click event
    var deviceId = e.target.dataset.deviceId;
    userMessage('Connecting to ' + formatId(deviceId));

    var peripheral = noble._peripherals[deviceId];
    if (!peripheral) {
        userMessage('Error connecting to ' + formatId(deviceId));
        return;
    }

    peripheral.connect(function(error) {
        userMessage('Connected to ' + formatId(deviceId));
        peripheral.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
            if (error) {
                userMessage('Error discovering services and characteristics for ' + peripheral.id);
                console.log(error);
                return;
            }

            detailsDiv.innerHTML = detailsTemplate({peripheral:peripheral, services: services});
            peripheral.disconnect();

        });
    });
    
}

var userMessage = function(message) {
    console.log(message);
    // this is a UI notification not a BLE notification
    new Notification('Bluetooth Info', { body: message, silent: true })
}

deviceList.addEventListener('click', connect, false);
