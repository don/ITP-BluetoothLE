// Port Arduino BLE button demo to Espurino running on the BBC Micro:bit
// https://github.com/don/ITP-BluetoothLE/blob/master/arduino/Button_v2/Button_v2.ino

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
  NRF.updateServices({
    0xFFE0 : {
      0xFFE1 : {
        value: value,
        notify: true
      }
    }
  });
}


// NOTE on the BBC Micro:bit button is the opposite of Puck.js
setWatch(function() {
  console.log("Pressed");
  notify(1);
}, BTN, {edge:"falling", debounce:50, repeat:true});

setWatch(function() {
  console.log("Released");
  notify(0);
}, BTN, {edge:"rising", debounce:50, repeat:true});
