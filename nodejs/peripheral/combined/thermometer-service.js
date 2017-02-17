var bleno = require('bleno');
var util = require('util');
var sensor = require('ds18b20');

var Characteristic = bleno.Characteristic;
var Descriptor = bleno.Descriptor;
var PrimaryService = bleno.PrimaryService;

var temperatureSensorId;
var lastTemp;

var TemperatureCharacteristic = function () {
  TemperatureCharacteristic.super_.call(this, {
    uuid: 'bbb1',
    properties: ['read', 'notify'],
    descriptors: [
      new Descriptor({
        uuid: '2901',
        value: 'Temperature'
      })]
  });
};
util.inherits(TemperatureCharacteristic, Characteristic);

TemperatureCharacteristic.prototype.onSubscribe = function (maxValueSize, updateValueCallback) {
  console.log('TemperatureCharacteristic subscribe');

  this.changeInterval = setInterval(function () {

    sensor.temperature(temperatureSensorId, function (err, result) {
      if (err) {
        console.log('Can not get temperature from sensor', err);
      } else {
        console.log('Sensor ' + temperatureSensorId + ' :', result);
        if (result != lastTemp) {
          lastTemp = result;
          var data = new Buffer(4);
          data.writeFloatLE(result, 0);

          console.log('TemperatureCharacteristic update value: ' + result);
          updateValueCallback(data);
        }
      }
    });
  }.bind(this), 2000);
};

TemperatureCharacteristic.prototype.onUnsubscribe = function () {
  console.log('TemperatureCharacteristic unsubscribe');

  if (this.changeInterval) {
    clearInterval(this.changeInterval);
    this.changeInterval = null;
  }
};

TemperatureCharacteristic.prototype.onReadRequest = function (offset, callback) {
  sensor.temperature(temperatureSensorId, function (err, result) {
    console.log('Sensor ' + temperatureSensorId + ' :', result);
    var data = new Buffer(4);
    data.writeFloatLE(result, 0);
    callback(Characteristic.RESULT_SUCCESS, data);
  });
};

var thermometerService = new PrimaryService({
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