var bleno = require('bleno');
var util = require('util');

var ledService = require('./led-service');
var buttonService = require('./button-service');
var thermometerService = require('./thermometer-service');

bleno.on('stateChange', function (state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('Combined', [ledService.uuid, buttonService.uuid, thermometerService.uuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function (error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([ledService, buttonService, thermometerService]);
  }
});

