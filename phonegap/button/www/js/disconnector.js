/*
Disconnect any periperal before the app reloads.

If the app reloads when it's connected to a peripheral, PhoneGap Developer App
still has a Bluetooth connection to the device. This means the peripheral won't
advertise, can't be discovered, and is orphaned until the app restarts.

This is a PhoneGap Developer App specific issue, but is similar to https://github.com/don/cordova-plugin-ble-central/issues/126.

These solutions are a bit of a kludge since I'm relying on the app.disconnect()
function for it to work. They also use the undocumented window.phonegap.app
property to guess if the code is running PhoneGap Developer App.
*/

/* global app */

if (cordova.platformId === 'ios') {

    // Disconnect peripheral when exiting app with 3 finger touch on iOS
    // Code borrowed PhoneGap Developer App middleware https://goo.gl/d8kvdH
    (function() {
        var currentTouches = {};

        document.addEventListener('touchstart', function(evt) {
            var touches = evt.touches || [evt],
                touch;
            for(var i = 0, l = touches.length; i < l; i++) {
                touch = touches[i];
                currentTouches[touch.identifier || touch.pointerId] = touch;
            }
        }, false);

        document.addEventListener('touchend', function(evt) {
            var touchCount = Object.keys(currentTouches).length;
            currentTouches = {};
            if (touchCount === 3) { // || touchCount === 4
              if (app && (typeof app.disconnect === 'function')) {
                console.log('Disconnecting peripheral because of touch navigation');
                app.disconnect();
              }
            }
        }, false);
    })(window);

    // Disconnect peripheral before app reloads on iOS of 4 finger touch or PhoneGap
    // Developer App detecting a server side code change.
    (function(){
        // http://blakeembrey.com/articles/2014/01/wrapping-javascript-functions/
        var before = function (before, fn) {
            return function () {
                before.apply(this, arguments);
                return fn.apply(this, arguments);
            };
        };

        var disconnect = function() {
            if (app && (typeof app.disconnect === 'function')) {
                console.log('Disconnecting periperal before reload');
                app.disconnect();
            }
        };

        document.addEventListener('deviceready', function(evt) {
            if (window.phonegap && window.phonegap.app) {
                window.location.reload = before(window.location.reload, disconnect);
            }
        });
    })(window);
}

if (cordova.platformId === 'android') {

    // disconnect any peripherals before unloading the app
    window.onbeforeunload = function(e) {
        if (app && (typeof app.disconnect === 'function')) {
            console.log('Disconnecting peripheral before reload');
            app.disconnect();
        }
    };

    // when running in PhoneGap Developer App
    // make navigator.app.exitApp go to homepage instead of exiting
    document.addEventListener('deviceready', function(evt) {
        if (window.phonegap && window.phonegap.app) {
            navigator.app.exitApp = function() {
                console.log('Going to homepage instead of exiting.');
                window.history.back(window.history.length);
            };
        }
    });
}
