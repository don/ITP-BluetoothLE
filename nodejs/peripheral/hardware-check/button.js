var Gpio = require('onoff').Gpio,
  led = new Gpio(18, 'out'),
  button = new Gpio(23, 'in', 'both');
 
button.watch(function(err, value) {
  console.log("button " + value);
  led.writeSync(value);
});
