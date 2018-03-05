var noble = require('noble');

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning();
    } else {
        noble.stopScanning();
        alert('Please enable Bluetooth');
    }
});

noble.on('discover', function(peripheral) {
    console.log(peripheral);

    //if (!peripheral.advertisement.localName) { return; }
    
    var listItem = document.createElement('li');
    listItem.innerHTML = 'Name: ' + peripheral.advertisement.localName + '<br/>' +
            'ID: ' + formatId(peripheral.id) + '<br/>' +
            'RSSI: ' + peripheral.rssi;
        deviceList.appendChild(listItem);
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
