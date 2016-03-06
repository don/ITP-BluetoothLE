# iBeacon

See slides 41 to 55 http://don.github.io/slides/2015-07-09-phillycocoa/#/41

Beacons are Broadcast Only

3 fields - UUID, Major, Minor

Beacons are an electronic sign post, or perhaps a light house. Beacons just sending out data. No connection, many people can view.

Use [nRF Master Control Panel](https://play.google.com/store/apps/details?id=no.nordicsemi.android.mcp&hl=en) on Android to scan for iBeacons and view details

## Beacon Examples

[RFduino Beacon](https://github.com/don/phillycocoa/tree/master/RFduinoBeacon)

[iOS Beacon](https://github.com/don/phillycocoa/tree/master/iBeacon)

Lots of hardware can be used to create beacons.

nRF8001 can NOT be used to create iBeacons because the advertising area is too small

nRF51 works fine

Beacons can be created with [BLEPeripheral](https://github.com/sandeepmistry/arduino-BLEPeripheral/blob/master/examples/iBeacon/iBeacon.ino) or [Bleno](https://github.com/sandeepmistry/bleno#start-advertising-ibeacon).

## Beacon Ranging Demo

[Source Code](https://github.com/don/ibeacon-demo)

 * App must specify the Beacon UUID. Can't scan for all IDs.
 * Demo scans for one beacon and ignores Major and Minor
 * Real applications would use major and minor to determine location/position.
 * Region monitoring can be low battery.
 * Ranging beacons inside a region is more battery intensive. 
 * Need to ask user for permissions to use Location.
 * Beacon region update are immediate, especially when leaving a region. This is fine for real apps, but not for demos.

## Broadcast Only

Beacons are broadcast only. GAP role broadcaster.

However many beacons have a BLE service for managing the beacon

## Beacons can't track you

iBeacons can't track you, they are broadcast only.

Apps that track iBeacons can be used to track your behavior. The app can report your location back to the server.

iBeacons are an Apple thing. It's BLE broadcast info, so technically it can run anywhere. Radius Networks had an Android API for iBeacons, but Apple shut them down.
http://beekn.net/2014/07/ibeacon-for-android/

Cordova Plugin iBeacon https://github.com/petermetz/cordova-plugin-ibeacon

iOS restricts iBeacon data, need to use CoreLocation rather than CoreBluetooth.
Android can parse the iBeacon data.
