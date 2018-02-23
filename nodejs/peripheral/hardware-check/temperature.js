//
// Getting all sensors data...
//
// @chamerling
//

var sensor = require('ds18b20');

sensor.sensors((err, ids) => {
  if (err) {
    console.log('Can not get sensor IDs', err);
    return;
  }
  
  ids.map(id => {
    sensor.temperature(id, (err, result) => {
      if (err) {
        console.log('Can not get temperature from sensor', err);
      } else {
        console.log(`Sensor ${id} is ${result}°C`);
      }
    });
  });
  
});