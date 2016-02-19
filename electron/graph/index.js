var SensorTag = require('sensortag');

// discover a specific SensorTag
SensorTag.discoverById('f24b134237724d04bb7a5f96505037cb', function(sensorTag) {
    console.log('Found ' + sensorTag.id);
    sensorTag.connectAndSetUp(function(error) {
        console.log('connectAndSetUp');
        if (error) {
            alert('Error ' + error);
        }

        sensorTag.enableAccelerometer(function(error) {
            console.log('enable accelerometer');
            if (error) { console.log (error); }
            sensorTag.notifyAccelerometer(function(error) {
                console.log('start notify for accelerometer');
                if (error) { console.log (error); }
            });
        });
    });

    sensorTag.on('accelerometerChange', function(x,y,z) {
        console.log(x,y,z);
        readings.push(x);
    });
});
