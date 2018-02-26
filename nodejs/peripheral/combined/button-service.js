// Button Service 0xFFE0
const Gpio = require('onoff').Gpio;
const button = new Gpio(23, 'in', 'both');
const bleno = require('bleno');

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
  
    button.watch(function (err, value) {
      console.log('button ' + value);
      const data = new Buffer(1);
      data[0] = value;
      updateValueCallback(data);
    });
  }

  onUnsubscribe() {
    console.log('ButtonCharacteristic unsubscribe');
    button.unwatchAll();
  }

}

const buttonService = new bleno.PrimaryService({
  uuid: 'ffe0',
  characteristics: [
    new ButtonCharacteristic()
  ]
});

// cleanup GPIO on exit
function exit() {
  button.unexport();
  process.exit();
}
process.on('SIGINT', exit);

module.exports = buttonService;