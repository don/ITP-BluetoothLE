// Button Service 0xFFE0
const bleno = require('bleno');
const five = require("johnny-five");
const Raspi = require("raspi-io");
const board = new five.Board({
  io: new Raspi(),
  repl: false
});

board.on("ready", function() {

  const button = new five.Button("GPIO23");

  button.on('down', () => {
    console.log('Button Pressed');
    const data = new Buffer([1]);
    buttonCharacteristic.notify(data);
  });

  button.on('up', () => {
    console.log('Button Released');
    const data = new Buffer([0]);
    buttonCharacteristic.notify(data);
  });

});

class ButtonCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: 'ffe1',
      properties: ['notify'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'Button'
        })
      ]
    });
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    console.log('ButtonCharacteristic subscribe');
    this.updateValueCallback = updateValueCallback;
  }

  onUnsubscribe(maxValueSize, updateValueCallback) {
    console.log('ButtonCharacteristic unsubscribe');
    this.updateValueCallback = null;
  }

  notify(value) {
    if (this.updateValueCallback) {
      this.updateValueCallback(value);
    }
  }
}

const buttonCharacteristic = new ButtonCharacteristic();
const buttonService = new bleno.PrimaryService({
  uuid: 'ffe0',
  characteristics: [
    buttonCharacteristic
  ]
});

bleno.on('stateChange', state => {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('Button', [buttonService.uuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', error => {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([buttonService]);
  }
});
