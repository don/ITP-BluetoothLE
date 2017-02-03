#define LED_PIN 6

void setup() {
  pinMode(LED_PIN, OUTPUT);
}  

void loop() {
  digitalWrite(LED_PIN, HIGH);   // turn the LED on
  delay(1000);                   // wait one second
  digitalWrite(LED_PIN, LOW);    // turn the LED off
  delay(1000);                   // wait one second
}
