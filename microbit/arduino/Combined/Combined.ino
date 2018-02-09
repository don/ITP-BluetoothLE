// Combine the LED, Button and Thermometer into one peripheral.
#include <BLEPeripheral.h>
#include <Adafruit_Microbit.h>

Adafruit_Microbit microbit;
Adafruit_Microbit_Matrix matrix;

#define BUTTON_PIN 5
#define BUTTON2_PIN 11

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

BLEFloatCharacteristic temperatureCharacteristic = BLEFloatCharacteristic("BBB1", BLERead | BLENotify | BLEBroadcast);
BLEDescriptor temperatureDescriptor = BLEDescriptor("2901", "degrees C");

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT);
  pinMode(BUTTON2_PIN, INPUT);
 
  // set advertised name
  blePeripheral.setLocalName("Combined");
  blePeripheral.setDeviceName("Combined");

  // We can only advertise one service due to an API limitation
  blePeripheral.setAdvertisedServiceUuid("721b");
  
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

  switchCharacteristic.setValue(0x01);
  dimmerCharacteristic.setValue(0xFF);

  // begin initialization
  blePeripheral.begin();
  
  matrix.begin();
  drawScreen();
  
  temperatureCharacteristic.broadcast();

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
  Serial.print(F("Characteristic event, written: "));

  if (switchCharacteristic.value()) {
    Serial.println(F("LED on"));
    drawScreen();
  } else {
    Serial.println(F("LED off"));
    matrix.clear();
  }

}

void dimmerCharacteristicWritten(BLECentral& central, BLECharacteristic& characteristic) {
  Serial.print(F("Dimmer set to: "));
  Serial.println(dimmerCharacteristic.value());

  drawScreen();
}

void drawScreen() {
  matrix.clear();  

  uint8_t brightness = dimmerCharacteristic.value();

  // brightness characteristic is 0 to 0xFF. divide by 10 to scale
  uint8_t rows = brightness/50;
  uint8_t cols = 5;
  uint8_t cols_in_last_row = brightness/10 % cols;

  // paint full rows
  for (uint8_t i = 0; i < rows; i++) {
    for (uint8_t j = 0; j < cols; j++) {
      matrix.drawPixel(j, 4-i, LED_ON);                 
    }
  }
  
  // last partial row (optional)
  for (uint8_t j = 0; j < cols_in_last_row; j++) {
    matrix.drawPixel(j, 4-rows, LED_ON);                 
  }    
}

void readButton() {
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
