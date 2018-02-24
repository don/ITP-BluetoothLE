// Port Arduino BLE Thermometer demo to Espurino running on the BBC Micro:bit
// https://github.com/don/ITP-BluetoothLE/blob/master/arduino/Thermometer/Thermometer.ino

let lastTemperature = 0;
const data = new Float32Array(1);

NRF.setAdvertising({},{name:'Thermometer'});

NRF.setServices({
    0xBBB0 : {
      0xBBB1 : {
        value: data.buffer,
        readable: true,
        notify: true,
        description: 'Degrees C'
      }
    }
  }, { advertise: [ 'BBB0' ] });

function notify(value) {
  console.log('Sending', value);
  data[0] = value;
  NRF.updateServices({
    0xBBB0 : {
      0xBBB1 : {
        value: data.buffer,
        notify: true
      }
    }
  });
}

// read temp every 2 seconds, notify if changed
setInterval(function() {
  const temperature = E.getTemperature();
  if (temperature != lastTemperature) {
    notify(temperature);
    lastTemperature = temperature;
  }
}, 2000);
