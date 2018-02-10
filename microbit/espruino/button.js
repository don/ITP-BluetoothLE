// Espurino Bluetooth Button Demo for BBC Micro:bit or Puck.js
// Texas Instruments Simple Key Service 
// http://bit.ly/sensortag-button

// NOTE: use firmware >= 1v95.176 with this sketch

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

setWatch(function(e) {
  notify(e.state);
}, BTN, {repeat:true, debounce:20, edge:"both"});

