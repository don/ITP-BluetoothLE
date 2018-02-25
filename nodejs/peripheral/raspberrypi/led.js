// LED Service 0xFF10
const Gpio = require('onoff').Gpio;
const led = new Gpio(18, 'out');
const bleno = require('bleno');

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
    data[0] = led.readSync();
    callback(this.RESULT_SUCCESS, data);
  }
  
  onWriteRequest(data, offset, withoutResponse, callback) {
    console.log('write request: ' + data.toString('hex'));
    led.writeSync(data[0]);
    callback(this.RESULT_SUCCESS);
  }
  
}

const lightService = new bleno.PrimaryService({
  uuid: 'ff10',
  characteristics: [
    new SwitchCharacteristic()
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
  console.log('on -> advertisingStart: ' + 
      (error ? 'error ' + error : 'success'));

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
