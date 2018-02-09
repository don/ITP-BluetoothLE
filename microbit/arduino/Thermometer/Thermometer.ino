#include <BLEPeripheral.h>
#include <Adafruit_Microbit.h>

Adafruit_Microbit microbit;

BLEPeripheral blePeripheral;
BLEService thermometerService = BLEService("BBB0");
BLEFloatCharacteristic temperatureCharacteristic = BLEFloatCharacteristic("BBB1", BLERead | BLENotify);
BLEDescriptor temperatureDescriptor = BLEDescriptor("2901", "degrees C");

unsigned long previousMillis = 0;  // will store last time temperature was updated
unsigned short interval = 2000;    // interval at which to read temperature (milliseconds)

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

// The Adafruit code averages many values to get a better number
// See https://github.com/adafruit/Adafruit_Microbit/blob/master/examples/ble_dietemp/ble_dietemp.ino
void pollTemperatureSensor()
{
  // note that this is the die temperature of the chip which is higher than the ambient temperature
  // cast to a float so we're compatible with the Arduino 101 service definition
  float temperature = (float)microbit.getDieTemp();  // getDieTemp is uint8_t

  // only set the characteristic value if the temperature has changed
  if (temperatureCharacteristic.value() != temperature) {
    temperatureCharacteristic.setValue(temperature);
    Serial.println(temperature);
  }
}

