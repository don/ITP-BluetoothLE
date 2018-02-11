// Scan for Bluetooth LE devices
const noble = require('noble');

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', peripheral => {
  console.log(
    `{ id: ${peripheral.id}, ` +
    `address: ${peripheral.address}, ` +
    `RSSI: ${peripheral.rssi}, ` +
    `name: ${peripheral.advertisement.localName} }`);
});
