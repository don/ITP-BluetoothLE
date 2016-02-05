// Import libraries (BLEPeripheral depends on SPI)
#include <SPI.h>
#include <BLEPeripheral.h>

// define pins (varies per shield/board)
// https://github.com/sandeepmistry/arduino-BLEPeripheral#pinouts
// Blend
#define BLE_REQ     9
#define BLE_RDY     8
#define BLE_RST     5

// create peripheral instance, see pinouts above
BLEPeripheral blePeripheral = BLEPeripheral(BLE_REQ, BLE_RDY, BLE_RST);

// create service
BLEService buttonService = BLEService("FFE0");

// create characteristic
BLECharCharacteristic buttonCharacteristic = BLECharCharacteristic("FFE1", BLENotify);
BLEDescriptor buttonDescriptor = BLEDescriptor("2901", "Button State");

#define BUTTON_PIN 7 // RedBear Blend
// #define BUTTON_PIN D2 // RedBear Nano
// #define BUTTON_PIN 5  // RFduino

unsigned long lastReadTime = 0;
int readInterval = 100;

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT);

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

  // limit how often we read the button
  if (millis() - lastReadTime > readInterval) {
    readButton();
    lastReadTime = millis();
  }
}

void readButton() {
  char buttonValue = digitalRead(BUTTON_PIN);

  // has the value changed since the last read?
  if (buttonCharacteristic.value() != buttonValue) {
    Serial.print("Button ");
    Serial.println(buttonValue, HEX);
    buttonCharacteristic.setValue(buttonValue);
  }
}
