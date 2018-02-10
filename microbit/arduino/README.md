# Arduino Bluetooth LE examples on BBC micro:bit 

These examples use Sandeep Mistry's [nRF5 Arduino core](https://github.com/sandeepmistry/arduino-nRF5) and [BLEPeripheral library](https://github.com/sandeepmistry/arduino-BLEPeripheral).

The nRF5 Arduino core is installed through the Arduino board manager and allows code to be compiled for nRF5x hardware, including the BBC micro:bit. Follow the [installation instructions](https://github.com/sandeepmistry/arduino-nRF5#installing) to setup your machine. 

You also need to install the Nordic SoftDevice on the micro:bit. Follow Sandeep's instructions to add the Arduino IDE plugin for [flashing a SoftDevice](https://github.com/sandeepmistry/arduino-nRF5#flashing-a-softdevice).

Select the following from the Tools menu
 * Board:"BBC micro:bit"
 * Softdevice: "S110"
 * Programmer: CMSIS-DAP

Then choose "nRF5 Flash SoftDevice". Once the soft device is flashed, the Arduino IDE can compile and load sketches onto the micro:bit. 
You only need to flash the soft device one time, not before every Arduino sketch. If you run Espruino, MicroPython, or https://makecode.microbit.org/ programs on your board, you'll need to flash the soft device again.

Adafruit has a more detailed [tutorial](https://learn.adafruit.com/use-micro-bit-with-arduino/overview) including alternate ways to get the SoftDevice onto the micro:bit.

Required Arduino Libraries
 * BLE Peripheral - https://github.com/sandeepmistry/arduino-BLEPeripheral
 * Adafruit microbit - https://github.com/adafruit/Adafruit_Microbit
 