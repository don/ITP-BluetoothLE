// Demonstrate broadcasting a characteristic value
// Use nRF Connect to see the counter value without connecting

let count = 0;

NRF.setServices({
    0xEEE0 : {
      0xEEE1 : {
        value: [0, 0],
        readable: true,
        notify: true,
        broadcast: true,
        description: 'Count'
      }
    }
  }, { advertise: [ 'EEE0' ] });

function notify() {
  const buffer = new Uint16Array([count]).buffer;
  NRF.updateServices({
    0xEEE0 : {
      0xEEE1 : {
        value: buffer,
        broadcast: true,
        notify: true
      }
    }
  });
  // Set the service data 0x16 to the count value
  NRF.setAdvertising({
    0xEEE0: buffer
  });
}

setInterval(() => {
  count++;
  if (count > 0xFFFF) {
    count = 0;
  }
  notify();
}, 1000);
