const bleno = require('bleno');
const Characteristic = bleno.Characteristic;
const PrimaryService = bleno.PrimaryService;

let switchStatus = 0;
let dimmerLevel = 0xFF;

function printStatus() {
  if (!switchStatus) {
    console.log('LED is OFF');
  } else {
    console.log('LED is ON. Brightness is', dimmerLevel);
  }
};

class SwitchCharacteristic extends Characteristic {
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
    console.log('LED is ' + (switchStatus === 0 ? 'OFF' : 'ON'));
    const data = new Buffer(1);
    data[0] = switchStatus;
    callback(this.RESULT_SUCCESS, data);
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    if (data[0]) {  // anything other than 0
      switchStatus = 1;
      if (dimmerLevel === 0) {
        dimmerLevel = 0xFF; // TODO notification
      }
    } else {
      switchStatus = 0;
    }
    printStatus();
    callback(this.RESULT_SUCCESS);
  }
}

class DimmerCharacteristic extends Characteristic {
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
    })
  }

  onReadRequest(offset, callback) {
    console.log('Dimmer level is ' + dimmerLevel);
    const data = new Buffer(1);
    data[0] = dimmerLevel;
    callback(this.RESULT_SUCCESS, data);
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    dimmerLevel = data[0];
    if (switchStatus === 0 && dimmerLevel > 0) {
      switchStatus = 1; // TODO notification
    } else if (switchStatus === 1 && dimmerLevel === 0) {
      switchStatus = 0; // TODO notification
    }
    printStatus();
    callback(this.RESULT_SUCCESS);
  }
}

const lightService = new PrimaryService({
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

console.log('Fake LED');
