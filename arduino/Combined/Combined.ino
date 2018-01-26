#if defined(NRF51) // RedBear Nano

#include <BLEPeripheral.h>
#define LED_PIN D3 
#define BUTTON_PIN D2
#define TEMPERATURE_PIN A4

#else // Arduino 101

#include <CurieBLE.h>
#define LED_PIN 6
#define BUTTON_PIN 7 
#define TEMPERATURE_PIN A0

#endif

unsigned long lastButtonReadTime = 0;
unsigned char buttonInterval = 100;

unsigned long lastTemperatureReadTime = 0;    // will store last time temperature was updated
unsigned short temperatureInterval = 2000;    // interval at which to read temperature (milliseconds)

// create peripheral instance
BLEPeripheral blePeripheral;

// LED service
BLEService ledService = BLEService("FF10");
BLECharCharacteristic switchCharacteristic = BLECharCharacteristic("FF11", BLERead | BLEWrite);
BLEDescriptor switchDescriptor = BLEDescriptor("2901", "Switch");
BLEUnsignedCharCharacteristic dimmerCharacteristic = BLEUnsignedCharCharacteristic("FF12", BLERead | BLEWrite);
BLEDescriptor dimmerDescriptor = BLEDescriptor("2901", "Dimmer");

// Button service
BLEService buttonService = BLEService("FFE0");
BLECharCharacteristic buttonCharacteristic = BLECharCharacteristic("FFE1", BLENotify);
BLEDescriptor buttonDescriptor = BLEDescriptor("2901", "Button State");

// Thermometer service
BLEService thermometerService = BLEService("BBB0");

BLEFloatCharacteristic temperatureCharacteristic = BLEFloatCharacteristic("BBB1", BLERead | BLENotify);
BLEDescriptor temperatureDescriptor = BLEDescriptor("2901", "degrees C");

void setup() {
  Serial.begin(9600);

  // set LED pin to output mode
  pinMode(LED_PIN, OUTPUT);
  analogWrite(LED_PIN, 0);
  // set Button pin to input mode
  pinMode(BUTTON_PIN, INPUT);
 
  // set advertised name
  blePeripheral.setLocalName("Combined");
  blePeripheral.setDeviceName("Combined");

  // We can only advertise one service due to an API limitation
  blePeripheral.setAdvertisedServiceUuid("721B");

  // LED Service
  blePeripheral.addAttribute(ledService);
  blePeripheral.addAttribute(switchCharacteristic);
  blePeripheral.addAttribute(switchDescriptor);
  blePeripheral.addAttribute(dimmerCharacteristic);
  blePeripheral.addAttribute(dimmerDescriptor);

  // Button Service
  blePeripheral.addAttribute(buttonService);
  blePeripheral.addAttribute(buttonCharacteristic);
  blePeripheral.addAttribute(buttonDescriptor);

  // Thermometer Service
  blePeripheral.addAttribute(thermometerService);
  blePeripheral.addAttribute(temperatureCharacteristic);
  blePeripheral.addAttribute(temperatureDescriptor);

  // assign event handlers for LED characteristics
  switchCharacteristic.setEventHandler(BLEWritten, switchCharacteristicWritten);
  dimmerCharacteristic.setEventHandler(BLEWritten, dimmerCharacteristicWritten);

  // begin initialization
  blePeripheral.begin();

  Serial.println(F("Bluetooth LED Button Thermometer"));
}

void loop() {
  // Tell the bluetooth radio to do whatever it should be working on	
  blePeripheral.poll();
  
  // limit how often we read the button
  if (millis() - lastButtonReadTime > buttonInterval) {
    readButton();
    lastButtonReadTime = millis();
  }
  
  // limit how often we read the temperature sensor
  if(millis() - lastTemperatureReadTime > temperatureInterval) {
    pollTemperatureSensor();
    lastTemperatureReadTime = millis();
  }
}

void switchCharacteristicWritten(BLECentral& central, BLECharacteristic& characteristic) {
  // central wrote new value to characteristic, update LED
  Serial.print(F("Switch set to: "));

  if (switchCharacteristic.value()) {
    Serial.println(F("on"));
    analogWrite(LED_PIN, 0xFF);
  } else {
    Serial.println(F("off"));
    analogWrite(LED_PIN, 0x0);
  }
}

void dimmerCharacteristicWritten(BLECentral& central, BLECharacteristic& characteristic) {
  Serial.print(F("Dimmer set to: 0x"));
  Serial.print(dimmerCharacteristic.value(), HEX);

  analogWrite(LED_PIN, dimmerCharacteristic.value());
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

void pollTemperatureSensor()
{
  float temperature = calculateTemperature();

  // only set the characteristic value if the temperature has changed
  if (temperatureCharacteristic.value() != temperature) {
    temperatureCharacteristic.setValue(temperature);
    Serial.print("Temperature ");
    Serial.print(temperature);
    Serial.println(" deg C");
  }
}

// calculate the temperature from the sensor reading
// https://learn.adafruit.com/tmp36-temperature-sensor/using-a-temp-sensor
float calculateTemperature()
{
  // read the sensor value
  int sensorValue = analogRead(TEMPERATURE_PIN);

  // 3.3v logic, 10-bit ADC
  float voltage = sensorValue * 3.3 / 1024.0;
  // 100 degrees per volt with 0.5 volt offset  
  float temperature = (voltage - 0.5) * 100;  

  return temperature;
}
