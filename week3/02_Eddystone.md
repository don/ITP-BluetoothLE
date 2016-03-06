# Eddystone Beacons

Slides 56, 57, 58 http://don.github.io/slides/2015-11-11-phillyandroid/#/56

Google Physical Web
Scott Jenson - http://physical-web.org

Eddystone Beacons are similar to iBeacon expect they broadcasts a URLs instead of UUIDs.

Concept behind physical web
 - Device gives you a URL
 - URL lets you interact with device
 - No apps required

URLs
- uses substitution to encode http://www. .com/ etc
- still only a small amount of space, need URL shorteners for long URLs

Also can broadcasts - UID, TLM (battery, temperature), UID with TLM,

Requires Physical Web app on your phone.
  iOS - https://itunes.apple.com/us/app/physical-web/id927653608?mt=8
  Android - https://play.google.com/store/apps/details?id=physical_web.org.physicalweb

Chrome 49 - Beta includes support for Physical Web Beacons
  Android - https://play.google.com/store/apps/details?id=com.chrome.beta

NodeJS

    $ npm install eddystone-beacon
    $ node
    > e = require('eddystone-beacon')
    > e.advertiseUrl('http://itp.nyu.edu');
