/**
 * Add a state change listener to notify the user if Bluetooth is disabled
 * Normally this is part of your app. It's in a separate file for the workshop
 * to help keep the example code simpler.
 */

// on Android, we can prompt the user to enable Bluetooth
// on iOS the user must manually enable Bluetooth
function enableBluetoothIfPossible() {
    if (cordova.platformId === 'android') {
        ble.enable(
            function() {
                console.log("Bluetooth is enabled");
            },
            function() {
                console.log("The user did *not* enable Bluetooth");
            }
        );
    }   
}

// Listen for Bluetooth state change notifications
document.addEventListener('deviceready', function(e) {
    ble.startStateNotifications(
        function(state) {
            console.log("Bluetooth is " + state);
            if (state === 'off') {
                navigator.notification.alert(
                    'Please enable Bluetooth to continue using this application.', 
                    enableBluetoothIfPossible, 'Bluetooth is required');
            }
        }
    );
}, false);