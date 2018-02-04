var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind any events that are required on startup.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'refreshDeviceList'
    // function, we must explicitly call 'app.refreshDeviceList(...);'
    onDeviceReady: function() {
        navigator.notification.alert("Device Ready!");
    }
};

app.initialize();
