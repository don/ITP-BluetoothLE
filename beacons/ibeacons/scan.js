// Based on LightBlue scanner
// https://github.com/PunchThrough/list-beacons/blob/master/index.js
'use strict'

const Bleacon = require('bleacon')

const startedAt = new Date().getTime()

function pad(str, len) {
  while (str.length < len) {
    str = '0' + str
  }
  return str
}

function formatUuid(id) {
    if (id.length < 32) {
        // not a uuid, just return what we got        
        return id
    }
    var formatted = id.slice(0,8) + '-' +
        id.slice(8,12) + '-' +
        id.slice(12,16) + '-' +
        id.slice(16,20) + '-' +
        id.slice(20);
    return formatted
}

Bleacon.on('discover', (beacon) => {
  const elapsed = new Date().getTime() - startedAt
  const uuid = formatUuid(beacon.uuid)
  const major = pad(beacon.major.toString(16), 6)
  const minor = pad(beacon.minor.toString(16), 6)
  let info = `${elapsed}: ${uuid} | ${major} | ${minor}`
  console.log(info)
})
Bleacon.startScanning()

console.log('0: Listening for iBeacons...')