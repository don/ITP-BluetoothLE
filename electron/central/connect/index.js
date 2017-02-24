var noble = require('noble');

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
    var listItem = document.createElement('li');    
    listItem.innerHTML = 'Name: ' + peripheral.advertisement.localName + '<br/>' +
            'ID: ' + formatId(peripheral.id) + '<br/>' +
            'RSSI: ' + peripheral.rssi;
        deviceList.appendChild(listItem);

    listItem.dataset.deviceId = peripheral.id;
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

var refreshDeviceList = function() {
    alert('TODO implement refresh');
}

var mapByServiceUuid = function(characteristics) {
    var m = {};

    characteristics.forEach(function(c){
        var serviceUuid = c._serviceUuid; // bad scoping crap since ES5
        var characteristicList = m[serviceUuid];
        if (!characteristicList) {
            characteristicList = [];
            m[serviceUuid] = characteristicList;
        }
        characteristicList.push(c);
    });

    return m;
}

var buildDeviceMarkup = function(peripheral) {
    var deviceDetails = document.createElement('p');
    // TODO format this better
    deviceDetails.innerHTML = peripheral.advertisement.localName + '<br/> ' + formatId(peripheral.id) + '<br/>' + peripheral.address + '<br/>' + 
        'Advertised Services ' + peripheral.advertisement.serviceUuids.join(',');
    return deviceDetails;
}

var printDetails = function(peripheral, services, characteristics) {

    // map characteristics by service uuid
    var characteristicMap = mapByServiceUuid(characteristics);
    
    detailsDiv.innerText = ''; // reset
    detailsDiv.appendChild(buildDeviceMarkup(peripheral));

    services.forEach(function(service) {
        var serviceDetails = document.createElement('div');
        serviceDetails.innerText = 'Service: ' + service.uuid;
        var characteristicList = characteristicMap[service.uuid];
        characteristicList.forEach(function(characteristic) {
            var charateristicDetails = document.createElement('div');
            charateristicDetails.innerText = 'Characteristic: ' + characteristic.uuid + ' ' + characteristic.properties;
            serviceDetails.appendChild(charateristicDetails);
        });

        detailsDiv.appendChild(serviceDetails);
        detailsDiv.appendChild(document.createElement('hr'));
    });
}

var connect = function(e) { // handles the click event
    var deviceId = e.target.dataset.deviceId;

    // TODO ask Sandeep if this is OK...
    var peripheral = noble._peripherals[deviceId];
    // TODO handle nil
    
    console.log('connecting to', deviceId);
    peripheral.connect(function(error) {
        console.log('connected to', deviceId);
        peripheral.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
            if (error) {
                console.log('Error discovering services and characteristics for ' + peripheral.id + ' : ' + error);
                return;
            }

            printDetails(peripheral, services, characteristics);
            peripheral.disconnect();

        });
    });
    
}

refreshButton.addEventListener('click', refreshDeviceList, false);
deviceList.addEventListener('click', connect, false);
