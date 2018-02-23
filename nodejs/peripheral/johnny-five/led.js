// LED Service 0xFF10
const bleno = require('bleno');
const five = require("johnny-five");
const Raspi = require("raspi-io");
const  board = new five.Board({
  io: new Raspi(),
  repl: false
});
let led;

board.on("ready", function() {
  led = new five.Led("GPIO18");
});

class SwitchCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: 'ff11',
      properties: ['read', 'write'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'Switch'
        })
      ]
    });
  }

  onReadRequest(offset, callback) {
    console.log('read request');
    const data = new Buffer(1);
      data[0] = led.value === 0 ? 0 : 1;
    callback(this.RESULT_SUCCESS, data);
  }
  
  onWriteRequest(data, offset, withoutResponse, callback) {
    console.log('write request: ' + data.toString('hex'));
      if (data[0]) {
        led.on();
      } else {
        led.off();
      }
    callback(this.RESULT_SUCCESS);
  }
  
}

class DimmerCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: 'ff12',
      properties: ['read', 'write'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'Dimmer'
        })
      ]
    });
  }

  onReadRequest(offset, callback) {
    console.log('read request');
    const data = new Buffer([led.value]);
    callback(this.RESULT_SUCCESS, data);
  }
  
  onWriteRequest(data, offset, withoutResponse, callback) {
    console.log('write request: ' + data.toString('hex'));
    led.brightness(data[0]);
    callback(this.RESULT_SUCCESS);
  }  
}

const lightService = new bleno.PrimaryService({
  uuid: 'ff10',
  characteristics: [
    new SwitchCharacteristic(),
    new DimmerCharacteristic()
  ]
});

bleno.on('stateChange', state => {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('Light', [lightService.uuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', error => {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([lightService]);
  }
});
