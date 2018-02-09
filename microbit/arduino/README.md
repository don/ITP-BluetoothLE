Bluetooth LE examples on BBC micro:bit using Sandeep Mistry's [nRF5 library](https://github.com/sandeepmistry/arduino-nRF5) and [BLEPeripheral](https://github.com/sandeepmistry/arduino-BLEPeripheral).

Install the board definition https://github.com/sandeepmistry/arduino-nRF5#installing. Be sure to set up your machine so you can update the softdevice on the micro:bit. https://github.com/sandeepmistry/arduino-nRF5#flashing-a-softdevice

You only need to update the Nordic SoftDevice once
 * Choose S110 SoftDevice
 * Choose CMSIS-DAP programmer
 * Choose nRF5 Flash SoftDevice

Once the soft device is flashed, the Arduino IDE can compile and load sketches onto the micro:bit.

Additional Libraries
 * Adafruit microbit - https://github.com/adafruit/Adafruit_Microbit
 * BLEPeripheral - https://github.com/sandeepmistry/arduino-BLEPeripheral