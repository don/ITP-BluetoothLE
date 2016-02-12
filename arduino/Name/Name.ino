// 
// Local Name vs Device Name
//
// Use Light Blue and nRF Master Control Panel to view the differences 
// between Local Name an Device Name.
//
#include <SPI.h>
#include <BLEPeripheral.h>

// define pins (varies per shield/board)
// https://github.com/sandeepmistry/arduino-BLEPeripheral#pinouts
#define BLE_REQ     9
#define BLE_RDY     8
#define BLE_RST     5

// create peripheral instance, see pinouts above
BLEPeripheral blePeripheral = BLEPeripheral(BLE_REQ, BLE_RDY, BLE_RST);

// create service
BLEService service = BLEService("1234");
BLECharCharacteristic characteristic = BLECharCharacteristic("79EDB581-4C67-45A0-BA22-515D1530672A", BLERead);

void setup() {
  // The Local Name is 0x09 in the Advertising Data
  // https://www.bluetooth.org/en-us/specification/assigned-numbers/generic-access-profile
  blePeripheral.setLocalName("LOCAL NAME");

  // Device Name is from the Generic Access Service 0x1800 Device Name Characteristic 0x2A00
  // https://developer.bluetooth.org/gatt/services/Pages/ServiceViewer.aspx?u=org.bluetooth.service.generic_access.xml
  // https://developer.bluetooth.org/gatt/characteristics/Pages/CharacteristicViewer.aspx?u=org.bluetooth.characteristic.gap.device_name.xml
  blePeripheral.setDeviceName("DEVICE NAME");
  
  blePeripheral.setAdvertisedServiceUuid(service.uuid());

  // add service and characteristics
  blePeripheral.addAttribute(service);
  blePeripheral.addAttribute(characteristic);

  // begin initialization
  blePeripheral.begin();
}

void loop() {
  // Tell the bluetooth radio to do whatever it should be working on
  blePeripheral.poll();
}

