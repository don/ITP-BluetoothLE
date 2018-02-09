// Port Arduino BLE LED demo to Espurino running on the BBC Micro:bit
// https://github.com/don/ITP-BluetoothLE/blob/master/arduino/LED/LED.ino

NRF.setServices({
  0xFF10 : {
    0xFF11 : {
      value: 0,
      readable: true,
      writable: true,
      onWrite: function(evt) {
        if (evt.data[0]) {
          // any non-zero value light all LEDs
          show(0b1111111111111111111111111);
        } else {
          show(0);
        }
      }
    }
  }
}, { advertise: [ 'FF10' ] });
