// Based on https://github.com/sandeepmistry/arduino-BLEPeripheral/blob/master/examples/HID/HID_keyboard/HID_keyboard.ino
// Copyright (c) Sandeep Mistry. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Import libraries (BLEPeripheral depends on SPI)
#include <SPI.h>
#include <BLEHIDPeripheral.h>
#include <BLEKeyboard.h>

#define RED_LED 2
#define GREEN_LED 3
#define BLUE_LED 4
#define BUTTON_A 5
#define BUTTON_B 6
#define BRIGHTNESS 16

BLEHIDPeripheral bleHIDPeripheral;
BLEKeyboard bleKeyboard;

void setup() {
  Serial.begin(9600);

  pinMode(GREEN_LED, OUTPUT);
  pinMode(BLUE_LED, OUTPUT);
  pinMode(BUTTON_A, INPUT);
  pinMode(BUTTON_B, INPUT);

  if (digitalRead(BUTTON_A) == HIGH) {
    // clear bond store data
    bleHIDPeripheral.clearBondStoreData();
    analogWrite(RED_LED, BRIGHTNESS);
    delay(1000);  
    analogWrite(RED_LED, LOW);
  }

  bleHIDPeripheral.setLocalName("HID Keyboard");
  bleHIDPeripheral.setDeviceName("HID Keyboard");
  bleHIDPeripheral.addHID(bleKeyboard);

  bleHIDPeripheral.begin();

  Serial.println(F("BLE HID Keyboard"));
  analogWrite(BLUE_LED, BRIGHTNESS);
}

void loop() {
  BLECentral central = bleHIDPeripheral.central();

  if (central) {
    // central connected to peripheral
    Serial.print(F("Connected to central: "));
    Serial.println(central.address());

    analogWrite(GREEN_LED, BRIGHTNESS);
    analogWrite(BLUE_LED, LOW);

    while (central.connected()) {

      // http://arduino.cc
      if (digitalRead(BUTTON_A) == HIGH) {
        bleKeyboard.write('h');
        bleKeyboard.write('t');
        bleKeyboard.write('t');
        bleKeyboard.write('p');
        bleKeyboard.write('s');
        bleKeyboard.write(':');
        bleKeyboard.write('/');
        bleKeyboard.write('/');
        bleKeyboard.write('a');
        bleKeyboard.write('r');
        bleKeyboard.write('d');
        bleKeyboard.write('u');
        bleKeyboard.write('i');
        bleKeyboard.write('n');
        bleKeyboard.write('o');
        bleKeyboard.write('.');
        bleKeyboard.write('c');
        bleKeyboard.write('c');
        bleKeyboard.write('\n');

        delay(1000);
      }

      // random text
      if (digitalRead(BUTTON_B) == HIGH) {
        bleKeyboard.print((char)random(33, 122));
      }
    }

    // central disconnected
    analogWrite(GREEN_LED, LOW);
    analogWrite(BLUE_LED, BRIGHTNESS);
    Serial.print(F("Disconnected from central: "));
    Serial.println(central.address());
  }
}
