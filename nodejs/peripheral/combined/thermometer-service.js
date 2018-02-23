// Thermometer Service 0xBBB0
const bleno = require('bleno');
const sensor = require('ds18b20');

const PrimaryService = bleno.PrimaryService;
const Characteristic = bleno.Characteristic;
const Descriptor = bleno.Descriptor;

let temperatureSensorId;
let lastTemp;

class TemperatureCharacteristic extends Characteristic {
  constructor() {
    super({
      uuid: 'bbb1',
      properties: ['read', 'notify'],
      descriptors: [
        new Descriptor({
          uuid: '2901',
          value: 'Temperature'
        })]
    });
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    console.log('TemperatureCharacteristic subscribe');
  
    this.changeInterval = setInterval(() => {
      sensor.temperature(temperatureSensorId, (err, result) => {
        if (err) {
          console.log('Can not get temperature from sensor', err);
        } else {
          //console.log(`Sensor ${temperatureSensorId} ${result}°C`);
          if (result != lastTemp) {
            lastTemp = result;
            const data = new Buffer(4);
            data.writeFloatLE(result, 0);
  
            console.log('TemperatureCharacteristic update value: ' + result);
            updateValueCallback(data);
          }
        }
      });
    }, 2000);
  }
  
  onUnsubscribe() {
    console.log('TemperatureCharacteristic unsubscribe');
  
    if (this.changeInterval) {
      clearInterval(this.changeInterval);
      this.changeInterval = null;
    }
  }

  onReadRequest(offset, callback) {
    sensor.temperature(temperatureSensorId, (err, result) => {
      console.log(`Sensor ${temperatureSensorId} ${result}°C`);
      const data = new Buffer(4);
      data.writeFloatLE(result, 0);
      callback(Characteristic.RESULT_SUCCESS, data);
    });
  };
}

const thermometerService = new PrimaryService({
  uuid: 'bbb0',
  characteristics: [
    new TemperatureCharacteristic()
  ]
});


// scan sensors and store our id in the global
sensor.sensors(function (err, ids) {
  if (err) {
    console.log('Can not get sensor IDs', err);
    process.exit(-1);
  } else {
    console.log(ids);
    temperatureSensorId = ids[0];
    console.log('Found temperatureSensorId ' + temperatureSensorId);
  }
});

module.exports = thermometerService;