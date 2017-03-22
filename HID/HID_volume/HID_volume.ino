// From Make:Bluetooth https://www.amazon.com/Make-Bluetooth-Projects-Raspberry-Smartphones/dp/1457187094
// https://github.com/sandeepmistry/arduino-BLEPeripheral/blob/master/examples/HID/HID_volume/HID_volume.ino
// Copyright (c) Sandeep Mistry. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

#include <Encoder.h>
#include <BLEHIDPeripheral.h>
#include <BLEMultimedia.h>

#define BLE_REQ 9
#define BLE_RDY 8
#define BLE_RST UNUSED

#define ENCODER_RIGHT_PIN 3
#define ENCODER_LEFT_PIN 4
#define BUTTON_PIN 5
#define INPUT_POLL_INTERVAL 100

BLEHIDPeripheral bleHIDPeripheral = BLEHIDPeripheral(BLE_REQ, BLE_RDY, BLE_RST);
BLEMultimedia bleMultimedia;

Encoder encoder(ENCODER_RIGHT_PIN, ENCODER_LEFT_PIN);

int buttonState;
unsigned long lastInputPollTime = 0;

void setup() {
  Serial.begin(9600);
  Serial.println("BLE HID Volume Knob");

  // use internal resistor for the button
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  buttonState = digitalRead(BUTTON_PIN);

  // Hold down button on start to unpair
  if (buttonState == LOW) {
    Serial.println(F("BLE HID Peripheral - clearing bond data"));
    bleHIDPeripheral.clearBondStoreData();
  }

  // set initial state
  encoder.write(0);

  bleHIDPeripheral.setLocalName("Volume");
  bleHIDPeripheral.setDeviceName("Volume");
  bleHIDPeripheral.addHID(bleMultimedia);
  // bleHIDPeripheral,setReportOffset(1); // Android only
  bleHIDPeripheral.begin();
}

void loop() {
  BLECentral central = bleHIDPeripheral.central();

  if (central) {
    Serial.print(F("Connected to central: "));
    Serial.println(central.address());

    while (bleHIDPeripheral.connected()) {
      pollInputs();
    }

    Serial.print(F("Disconnected from central: "));
    Serial.println(central.address());
  }
}

void pollInputs() {
  if (millis() - lastInputPollTime > INPUT_POLL_INTERVAL) {
    pollButton();
    pollEncoder();
    lastInputPollTime = millis();
  }
}

void pollButton() {
  int tempButtonState = digitalRead(BUTTON_PIN);

  if (tempButtonState != buttonState) {
    buttonState = tempButtonState;

    if (buttonState == LOW) {
      Serial.println(F("Mute"));
      bleMultimedia.write(MMKEY_MUTE);
    }
  }
}

void pollEncoder() {
  int encoderState = encoder.read();

  if (encoderState != 0) {
    if (encoderState > 0) {
      Serial.println(F("Volume up"));
      bleMultimedia.write(MMKEY_VOL_UP);
    } else {
      Serial.println(F("Volume down"));
      bleMultimedia.write(MMKEY_VOL_DOWN);
    }
    encoder.write(0);
  }
}


