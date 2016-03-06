# Node.js

## Noble and Bleno

Node.js Libraries

[Bleno](https://github.com/sandeepmistry/bleno) - Create BLE peripherals, similar to what we did with Arduino

[Noble](https://github.com/sandeepmistry/noble) - BLE Central controls BLE peripherals, similar to what we did with PhoneGap

 - Bleno and Noble run on Windows, Mac and Linux
 - Runs on hardware like Raspberry Pi, Beagle Bone Black, Intel Edison and Galileo, CHIP
 - Devices like Raspberry Pi have GPIO, allowing us to control hardware similar to Arduino

Moving to RPi means you have more power, networking, etc. But you have more overhead. Now you need to manage an OS etc. There are tradeoffs with RPi vs Arduino.

Slides http://don.github.io/slides/2015-09-27-rpi-ble/#/

Code https://github.com/don/mfny2015-rpi-ble.git

## Sensor Tag Remote

Bleno version
https://github.com/MakeBluetooth/sensor-tag-remote/blob/master/remote.js

Simplified version using Sandeep's Sensor Tag library
https://github.com/MakeBluetooth/sensor-tag-remote/blob/master/simple.js

SensorTag has some well designed Bluetooth services. http://bit.ly/sensortag-guide

Bleno APIs work great but can be a bit verbose. Write some wrappers to make specific devices easier to use, like Sandeep's [SensorTag Library](https://github.com/sandeepmistry/node-sensortag). Use [noble device](https://www.npmjs.com/package/noble-device) to help create your wrappers. [robosmart](https://www.npmjs.com/package/robosmart) is another good example.
