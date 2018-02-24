// Espurino Bluetooth Button Demo for Micro:bit
// Texas Instruments Simple Key Service 
// http://bit.ly/sensortag-button
//
// 0x00 - no buttons pressed    000
// 0x01 - button A pressed      001
// 0x02 - button B pressed      010
// 0x03 - both buttons pressed  011
//

NRF.setAdvertising({},{name:'Button v2'});

NRF.setServices({
  0xFFE0 : {
    0xFFE1 : {
      value: 0,
      readable: true,
      notify: true
    }
  }
}, { advertise: [ 'FFE0' ] });

function notify(value) {
  console.log('Button state', value);
  NRF.updateServices({
    0xFFE0 : {
      0xFFE1 : {
        value: value,
        notify: true
      }
    }
  });
}

function buttonState() {
  const a = digitalRead(BTN1);      // 0 or 1
  const b = digitalRead(BTN2) * 2;  // 0 or 2
  return (a | b);
}

setWatch(function(e) {
  notify(buttonState());
}, BTN1, {repeat:true, debounce:20, edge:"both"});

setWatch(function(e) {
  notify(buttonState());
}, BTN2, {repeat:true, debounce:20, edge:"both"});

