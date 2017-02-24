var bleno = require('bleno');
var util = require('util');

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
  console.log('subscribe');
  new Notification('Button', { body: 'Central subscribed to button change notifications', silent: true });

  var button = document.querySelector('button');

  var onmousedown = function() {
    console.log("Button Pressed");
    var data = new Buffer([1]);
    updateValueCallback(data);
  }
  var onmouseup = function() {
    console.log("Button Released");
    var data = new Buffer([0]);
    updateValueCallback(data);  
  }

  button.addEventListener("mousedown", onmousedown, false);
  button.addEventListener("mouseup", onmouseup , false);

  // create function to remove event listeners later
  button.removeEventListeners = function() {
    button.removeEventListener("mousedown", onmousedown);
    button.removeEventListener("mouseup", onmouseup);
  }
};

ButtonCharacteristic.prototype.onUnsubscribe = function () {
  console.log('unsubscribe');
  new Notification('Button', { body: 'Central unsubscribed from button notifications', silent: true });

  var button = document.querySelector('button');
  button.removeEventListeners();
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
    new Notification('Button', { body: 'Bluetooth is off' });
    bleno.stopAdvertising();    
  }
});

bleno.on('advertisingStart', function (error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([buttonService]);
  }
});
