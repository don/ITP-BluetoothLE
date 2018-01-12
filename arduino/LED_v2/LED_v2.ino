#include <BLEPeripheral.h>
#include <Adafruit_Microbit.h>

Adafruit_Microbit_Matrix microbit;

// create peripheral instance
BLEPeripheral blePeripheral;

// create service
BLEService ledService = BLEService("FF10");

// create switch and dimmer characteristic
BLECharCharacteristic switchCharacteristic = BLECharCharacteristic("FF11", BLERead | BLEWrite);
BLEDescriptor switchDescriptor = BLEDescriptor("2901", "Switch");
BLEUnsignedCharCharacteristic dimmerCharacteristic = BLEUnsignedCharCharacteristic("FF12", BLERead | BLEWrite);
BLEDescriptor dimmerDescriptor = BLEDescriptor("2901", "Dimmer");

void setup() {
  Serial.begin(9600);

  // set advertised local name and service UUID
  blePeripheral.setLocalName("LED");
  blePeripheral.setDeviceName("LED");
  blePeripheral.setAdvertisedServiceUuid(ledService.uuid());

  // add service and characteristics
  blePeripheral.addAttribute(ledService);
  blePeripheral.addAttribute(switchCharacteristic);
  blePeripheral.addAttribute(switchDescriptor);
  blePeripheral.addAttribute(dimmerCharacteristic);
  blePeripheral.addAttribute(dimmerDescriptor);

  // assign event handlers for characteristic
  switchCharacteristic.setEventHandler(BLEWritten, switchCharacteristicWritten);
  dimmerCharacteristic.setEventHandler(BLEWritten, dimmerCharacteristicWritten);
  
  switchCharacteristic.setValue(0x01);
  dimmerCharacteristic.setValue(40);
  
  // begin initialization
  blePeripheral.begin();

  microbit.begin();
  //microbit.fillScreen(LED_ON);
  drawScreen();

  Serial.println(F("Bluetooth LED"));
}

void loop() {
  // Tell the bluetooth radio to do whatever it should be working on	
  blePeripheral.poll();
}

void switchCharacteristicWritten(BLECentral& central, BLECharacteristic& characteristic) {
  // central wrote new value to characteristic, update LED
  Serial.print(F("Characteristic event, written: "));

  if (switchCharacteristic.value()) {
    Serial.println(F("LED on"));
    drawScreen();
  } else {
    Serial.println(F("LED off"));
    microbit.clear();
  }

}

void dimmerCharacteristicWritten(BLECentral& central, BLECharacteristic& characteristic) {
  Serial.print(F("Dimmer set to: "));
  Serial.println(dimmerCharacteristic.value());

  drawScreen();
}

void drawScreen() {
  microbit.clear();  

  uint8_t brightness = dimmerCharacteristic.value();

  // brightness characteristic is 0 to 0xFF. divide by 10 to scale
  uint8_t rows = brightness/50;
  uint8_t cols = 5;
  uint8_t cols_in_last_row = brightness/10 % cols;

  // paint full rows
  for (uint8_t i = 0; i < rows; i++) {
    for (uint8_t j = 0; j < cols; j++) {
      microbit.drawPixel(j, 4-i, LED_ON);                 
    }
  }
  
  // last partial row (optional)
  for (uint8_t j = 0; j < cols_in_last_row; j++) {
    microbit.drawPixel(j, 4-rows, LED_ON);                 
  }    
}

