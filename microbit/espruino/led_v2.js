// Port Arduino BLE LED demo to Espurino running on the BBC Micro:bit
// https://github.com/don/ITP-BluetoothLE/blob/master/arduino/LED_v2/LED_v2.ino

NRF.setAdvertising({},{name:'LED v2'});

function setSwitch(evt) {
  if (evt.data[0]) {
    // any non-zero value light all LEDs
    show(0b1111111111111111111111111);
  } else {
    show(0);
  }
}

// convert 0 to 255 to number of LEDs
function setBrightness(evt) {
  const brightness = evt.data[0];
  let s = ''; // binary string representing LEDs
  for (let i=0; i < brightness; i += 10) {
    s += '1'; 
  }
  if (s === '') { s = '0'; }
  const value = parseInt(s, 2);
  show(value);
}

NRF.setServices({
  0xFF10 : {
    0xFF11 : {
      value: 0,
      readable: true,
      writable: true,
      onWrite: setSwitch
    },
    0xFF12 : {
      value: 255,
      readable: true,
      writable: true,
      onWrite: setBrightness
    }
  }
}, { advertise: [ 'FF10' ] });

