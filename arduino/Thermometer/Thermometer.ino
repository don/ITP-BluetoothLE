#include <SPI.h>
#include <BLEPeripheral.h>

// define pins (varies per shield/board)
// https://github.com/sandeepmistry/arduino-BLEPeripheral#pinouts
// Blend
#define BLE_REQ 9
#define BLE_RDY 8
#define BLE_RST 5

BLEPeripheral blePeripheral = BLEPeripheral(BLE_REQ, BLE_RDY, BLE_RST);
BLEService thermometerService = BLEService("BBB0");
BLEFloatCharacteristic temperatureCharacteristic = BLEFloatCharacteristic("BBB1", BLERead | BLENotify);
BLEDescriptor temperatureDescriptor = BLEDescriptor("2901", "degrees C");

#define TEMPERATURE_PIN A0 // RedBear Blend
// #define TEMPERATURE_PIN A4 // RedBear Nano
// #define TEMPERATURE_PIN 2  // RFduino

long previousMillis = 0;  // will store last time temperature was updated
long interval = 2000;     // interval at which to read temperature (milliseconds)
void setup()
{
  Serial.begin(9600);
  Serial.println(F("Bluetooth Low Energy Thermometer"));

  // set advertised name and service
  blePeripheral.setLocalName("Thermometer");
  blePeripheral.setDeviceName("Thermometer");
  blePeripheral.setAdvertisedServiceUuid(thermometerService.uuid());

  // add service and characteristic
  blePeripheral.addAttribute(thermometerService);
  blePeripheral.addAttribute(temperatureCharacteristic);
  blePeripheral.addAttribute(temperatureDescriptor);

  blePeripheral.begin();
}

void loop()
{
  // Tell the bluetooth radio to do whatever it should be working on
  blePeripheral.poll();

  // limit how often we read the sensor
  if(millis() - previousMillis > interval) {
    pollTemperatureSensor();
    previousMillis = millis();
  }
}

void pollTemperatureSensor()
{
  float temperature = calculateTemperature();

  // only set the characteristic value if the temperature has changed
  if (temperatureCharacteristic.value() != temperature) {
    temperatureCharacteristic.setValue(temperature);
    Serial.println(temperature);
  }
}

// calculate the temperature from the sensor reading
// https://learn.adafruit.com/tmp36-temperature-sensor/using-a-temp-sensor
float calculateTemperature()
{
  // read the sensor value
  int sensorValue = analogRead(TEMPERATURE_PIN);

  float voltage = sensorValue * 5.0; // RedBear Blend
  //float voltage = sensorValue * 3.3; // RedBear Nano & RFduino
  voltage /= 1024.0;
  float temperature = (voltage - 0.5) * 100; // 100 degrees per volt with 0.5 volt offset

  return temperature;
}
