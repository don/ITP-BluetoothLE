// LED Service 0xFF10
var Gpio = require('onoff').Gpio,
  led = new Gpio(18, 'out');

var bleno = require('bleno');
var util = require('util');

var Characteristic = bleno.Characteristic;
var PrimaryService = bleno.PrimaryService;

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
util.inherits(SwitchCharacteristic, Characteristic);

SwitchCharacteristic.prototype.onReadRequest = function (offset, callback) {
  console.log('read request');
  var data = new Buffer(1);
  data[0] = led.readSync();
  callback(this.RESULT_SUCCESS, data);
};

SwitchCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
  console.log('write request: ' + data.toString('hex'));
  led.writeSync(data[0]);
  callback(this.RESULT_SUCCESS);
};

var lightService = new PrimaryService({
  uuid: 'ff10',
  characteristics: [
    new SwitchCharacteristic()
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

// cleanup GPIO on exit
function exit() {
  led.unexport();
  process.exit();
}
process.on('SIGINT', exit);
