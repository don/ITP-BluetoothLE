var bleno = require('bleno');
var util = require('util');
var switchStatus = 0;
var dimmerLevel = 0xFF;

var updateUI = function () {

  var led = document.querySelector('.led-blue');
  var opacity = dimmerLevel/255.0; // 0 min, 1 max
  if (opacity < .1) { opacity = 0.1; } // don't want LED to completely disappear

  if (!switchStatus) {
    console.log('LED is OFF');
    switchStatusDiv.innerHTML = 'Off';
    opacity = 0.1; // OFF
  } else {
    console.log('LED is ON. Brightness is', dimmerLevel);
    switchStatusDiv.innerHTML = 'On';
  }
  led.style.opacity = opacity;
  dimmerStatusDiv.innerHTML = (dimmerLevel * 100 / 255.0).toFixed(1) + '%';

};

var SwitchCharacteristic = function () {
  SwitchCharacteristic.super_.call(this, {
    uuid: 'ff11',
    properties: ['read', 'write'],
    descriptors: [
      new bleno.Descriptor({
        uuid: '2901',
        value: 'Switch'
      })
    ]
  });
};
util.inherits(SwitchCharacteristic, bleno.Characteristic);

SwitchCharacteristic.prototype.onReadRequest = function (offset, callback) {
  console.log('read request');
  console.log('LED is ' + (switchStatus === 0 ? 'OFF' : 'ON'));
  var data = new Buffer(1);
  data[0] = switchStatus;
  callback(this.RESULT_SUCCESS, data);
};

SwitchCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
  console.log('write request: ' + data.toString('hex'));
  if (data[0]) {  // anything other than 0
    switchStatus = 1;
    if (dimmerLevel === 0) {
      dimmerLevel = 0xFF; // NOTE: this should really send a notification
    }
  } else {
    switchStatus = 0;
  }
  updateUI();
  callback(this.RESULT_SUCCESS);
};

var DimmerCharacteristic = function () {
  DimmerCharacteristic.super_.call(this, {
    uuid: 'ff12',
    properties: ['read', 'write'],
    descriptors: [
      new bleno.Descriptor({
        uuid: '2901',
        value: 'Dimmer'
      })
    ]
  });
};
util.inherits(DimmerCharacteristic, bleno.Characteristic);

DimmerCharacteristic.prototype.onReadRequest = function (offset, callback) {
  console.log('Read request', this.uuid);
  console.log('Dimmer level is ' + dimmerLevel);
  var data = new Buffer(1);
  data[0] = dimmerLevel;
  callback(this.RESULT_SUCCESS, data);
};

DimmerCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
  console.log('write request: ' + data.toString('hex'));
  dimmerLevel = data[0];
  if (switchStatus === 0 && dimmerLevel > 0) {
    switchStatus = 1;
  } else if (switchStatus === 1 && dimmerLevel === 0) {
    switchStatus = 0;
  }
  updateUI();
  callback(this.RESULT_SUCCESS);
};

var lightService = new bleno.PrimaryService({
  uuid: 'ff10',
  characteristics: [
    new SwitchCharacteristic(),
    new DimmerCharacteristic()
  ]
});

bleno.on('stateChange', function (state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('Light', [lightService.uuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function (error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([lightService]);
  }
});

