#include <BLEPeripheral.h>

// Act like TI SensorTag and use bitmask for button data
// 0x01 - button A pressed      001
// 0x02 - button B pressed      010
// 0x03 - both buttons pressed  011

// create peripheral instance
BLEPeripheral blePeripheral;

// create service
BLEService buttonService = BLEService("FFE0");

// create characteristic
BLECharCharacteristic buttonCharacteristic = BLECharCharacteristic("FFE1", BLENotify);
BLEDescriptor buttonDescriptor = BLEDescriptor("2901", "Button State");

#define BUTTON_PIN 5
#define BUTTON2_PIN 11

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT);
  pinMode(BUTTON2_PIN, INPUT);

  // set advertised local name and service UUID
  blePeripheral.setLocalName("Button");
  blePeripheral.setDeviceName("Button");
  blePeripheral.setAdvertisedServiceUuid(buttonService.uuid());

  // add service and characteristics
  blePeripheral.addAttribute(buttonService);
  blePeripheral.addAttribute(buttonCharacteristic);
  blePeripheral.addAttribute(buttonDescriptor);

  // begin initialization
  blePeripheral.begin();
  Serial.println(F("Bluetooth Button"));
}

void loop() {
  // Tell the bluetooth radio to do whatever it should be working on	
  blePeripheral.poll();
  
  uint8_t button1Value = digitalRead(BUTTON_PIN);
  uint8_t button2Value = digitalRead(BUTTON2_PIN);

  // button values are opposite, 0 is pressed, 1 is released
  // flip the bit 0 becomes 1 and 1 becomes 0
  // https://playground.arduino.cc/Code/BitMath
  button1Value ^= 1;
  button2Value ^= 1;

  // button 2 is 0 or 2
  button2Value = button2Value * 2;

  // bitwise or the values together
  // (add a table here)
  uint8_t buttonValue = button1Value | button2Value;
  
  // has the value changed since the last read?
  if (buttonCharacteristic.value() != buttonValue) {
    Serial.print("Button ");
    Serial.println(buttonValue, HEX);
    buttonCharacteristic.setValue(buttonValue);
  }
}
