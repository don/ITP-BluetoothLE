var SensorTag = require('sensortag');

// discover a specific SensorTag. Use ../../../nodejs/central/scan.js to discover the uuid of your SensorTag
SensorTag.discoverById('b85af4ae641540f886ea9711b395e624', function(sensorTag) {
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
