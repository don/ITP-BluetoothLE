const bleno = require('bleno');

const lightService = require('./light-service');
const buttonService = require('./button-service');
const thermometerService = require('./thermometer-service');

bleno.on('stateChange', state => {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('Combined',
       [lightService.uuid, buttonService.uuid, thermometerService.uuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', error => {
  console.log('on -> advertisingStart: ' + 
       (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([lightService, buttonService, thermometerService]);
  }
});

