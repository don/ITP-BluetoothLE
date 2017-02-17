var bleno = require('bleno');
var util = require('util');
var keypress = require('keypress');

var ButtonCharacteristic = function () {
  ButtonCharacteristic.super_.call(this, {
    uuid: 'ffe1',
    properties: ['notify'],
    descriptors: [
      new bleno.Descriptor({
        uuid: '2901',
        value: 'Button'
      })
    ]
  });
};
util.inherits(ButtonCharacteristic, bleno.Characteristic);

ButtonCharacteristic.prototype.onSubscribe = function (maxValueSize, updateValueCallback) {
  console.log('ButtonCharacteristic subscribe');

  var KEYPRESS_TIMEOUT = 500;
  var timeout = null;

  // send button not pressed
  var clearKeypress = function () {
    var data = new Buffer([0]);
    updateValueCallback(data);
    timeout = null;
  };

  keypress(process.stdin);
  process.stdin.on('keypress', function (ch, key) {

    if (key && key.ctrl && key.name == 'c') {
      process.exit();
    }

    if (key && key.name == 'z') {
      if (timeout) {
        // key is still pressed, cancel automatic button up
        // create a new timeout and return without sending button down
        clearTimeout(timeout);
        timeout = setTimeout(clearKeypress, KEYPRESS_TIMEOUT);
        return;
      }
      var data = new Buffer([1]);
      updateValueCallback(data);
      timeout = setTimeout(clearKeypress, KEYPRESS_TIMEOUT);
    }
  });
  process.stdin.setRawMode(true);
  process.stdin.resume();
};

var buttonService = new bleno.PrimaryService({
  uuid: 'ffe0',
  characteristics: [
    new ButtonCharacteristic()
  ]
});

bleno.on('stateChange', function (state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('Button', [buttonService.uuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function (error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([buttonService]);
  }
});
