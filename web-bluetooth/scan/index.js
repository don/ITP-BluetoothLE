document.querySelector('#startButton').addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (isWebBluetoothEnabled()) {
        ChromeSamples.clearLog();
        onStartButtonClick();
    }
});

var log = ChromeSamples.log;

function onStartButtonClick() {
  
  log('Scanning...');
  navigator.bluetooth.requestDevice({
    acceptAllDevices: true
    })
  .catch(error => {
    log('Error: ' + error);
  });
}
