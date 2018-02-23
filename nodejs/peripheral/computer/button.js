const bleno = require('bleno');
const keypress = require('keypress');

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
    console.log('Press the Z key');
  
    const KEYPRESS_TIMEOUT = 500;
    let timeout = null;
  
    // send button not pressed
    const clearKeypress = function () {
      const data = new Buffer([0]);
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
        const data = new Buffer([1]);
        updateValueCallback(data);
        timeout = setTimeout(clearKeypress, KEYPRESS_TIMEOUT);
      }
    });
    process.stdin.setRawMode(true);
    process.stdin.resume();
  }
}

const buttonService = new bleno.PrimaryService({
  uuid: 'ffe0',
  characteristics: [
    new ButtonCharacteristic()
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
