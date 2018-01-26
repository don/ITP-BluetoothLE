// Broadcast Characteristic Value
// Simple counter that broadcasts a value
#include <CurieBLE.h>

uint8_t count = 0;
unsigned long previousMillis = 0;  // will store last time counter was updated
unsigned short interval = 1000;    // interval at which to update counter (milliseconds)

BLEPeripheral peripheral;
BLEService service = BLEService("EEE0");
BLEShortCharacteristic characteristic = BLEShortCharacteristic("EEE1", BLERead | BLENotify | BLEBroadcast);

void setup() {
  Serial.begin(9600);

  peripheral.setLocalName("BLEBroadcast");
  peripheral.setAdvertisedServiceUuid(service.uuid());
  
  peripheral.addAttribute(service);
  peripheral.addAttribute(characteristic);
  
  characteristic.setValue(count);
  characteristic.broadcast();

  peripheral.begin();

  Serial.println(F("BLE Broadcast Count"));
}

void loop() {
    peripheral.poll();
    if (millis() - previousMillis > interval) {
      characteristic.setValue(count);    
      count++;
      previousMillis = millis();
    }
}
