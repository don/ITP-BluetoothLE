var Bleacon = require('bleacon')

// Estimote UUID
var uuid = 'B9407F30-F5F8-466E-AFF9-25556B57FE6D';
var major = 43690; // 0 - 65535
var minor = 12; // 0 - 65535
var measuredPower = -59; // -128 - 127 (measured RSSI at 1 meter)

Bleacon.startAdvertising(uuid, major, minor, measuredPower);