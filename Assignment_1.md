## Assignment 1 - Design and build a Bluetooth LE Peripheral

1) Create the service definition
 * Service - Name & UUID
 * Characteristics - Name, UUID, Properties, Description

  Your peripheral should have at *least* one characteristic. Choose read, write, notify or any combination of properties that makes sense for your project.

2) Build the peripheral using Arduino and [BLEPeripheral](https://github.com/sandeepmistry/arduino-BLEPeripheral#)
  * Check the [compatible hardware list](https://github.com/sandeepmistry/arduino-BLEPeripheral#compatible-hardware)
  * The equipment room had RFduino and RedBear BLE Nano.

3) Test with LightBlue or nRF Master Control Panel

4) Submit files (or github link) via email to dc159@nyu.edu
 * service definition
 * arduino code
 * fritzing diagram (and/or photos) of hardware

For week 2, you'll write a phone application that uses this peripheral.

Some ideas for peripherals
 * DHT-22 temperature and humidity sensor
 * Barometric pressure sensor
 * Distance sensor
 * Motion sensor
 * Noise Level sensor
 * Control neopixels lights
 * Control a solenoid
 * Control a motor
