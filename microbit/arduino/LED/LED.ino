#include <BLEPeripheral.h>

const int COL1 = 3;         // Column #1 control
const int LED_PIN = 26;     // 'row 1' led

// create peripheral instance
BLEPeripheral blePeripheral;

// create service
BLEService ledService = BLEService("FF10");

// create switch characteristic
BLECharCharacteristic switchCharacteristic = BLECharCharacteristic("FF11", BLERead | BLEWrite);
BLEDescriptor switchDescriptor = BLEDescriptor("2901", "Switch");

void setup() {

  // because the LEDs are multiplexed, we must ground the opposite side of the LED
  pinMode(COL1, OUTPUT);
  digitalWrite(COL1, LOW); 
     
  Serial.begin(9600);

  // set LED pin to output mode
  pinMode(LED_PIN, OUTPUT);

  // set advertised local name and service UUID
  blePeripheral.setLocalName("LED");
  blePeripheral.setDeviceName("LED");
  blePeripheral.setAdvertisedServiceUuid(ledService.uuid());

  // add service and characteristics
  blePeripheral.addAttribute(ledService);
  blePeripheral.addAttribute(switchCharacteristic);
  blePeripheral.addAttribute(switchDescriptor);

  // assign event handlers for characteristic
  switchCharacteristic.setEventHandler(BLEWritten, switchCharacteristicWritten);

  // begin initialization
  blePeripheral.begin();

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
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.println(F("LED off"));
    digitalWrite(LED_PIN, LOW);
  }
}
