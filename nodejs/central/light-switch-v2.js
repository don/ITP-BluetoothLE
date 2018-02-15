// Control Bluetooth LED Peripheral 
// Use inquirer to provide a question based UI
const noble = require('noble');
const inquirer = require('inquirer');

const LED_SERVICE_UUID = 'ff10';
const SWITCH_CHARACTERISTIC_UUID = 'ff11';
const DIMMER_CHARACTERISTIC_UUID = 'ff12';
const COMBINED_UUID = '721b';
const MIN_BRIGHTNESS = 0x00;
const MAX_BRIGHTNESS = 0xFF;

const devices = {};

noble.on('stateChange', state => {
    if (state === 'poweredOn') {
        console.log('Scanning for LED Devices.');
        noble.startScanning([LED_SERVICE_UUID, COMBINED_UUID]);
        setTimeout(stopScanning, 3000);
    } else {
        noble.stopScanning();
        console.log('Bluetooth is off. Stopped Scan.');
    }
});

noble.on('discover', peripheral => {
    const name = peripheral.advertisement.localName;
    // store the peripherals keyed by name
    devices[name] = peripheral;
});

function stopScanning() {
    noble.stopScanning();
    // TODO don't show device list if empty
    showDeviceList();
}

function showDeviceList() {
    const questions = [{
        type: 'list',
        name: 'deviceName',
        message: 'Choose Device?',
        choices: Object.keys(devices)
    }];
    inquirer.prompt(questions).then(answers => {
        // get the peripheral from our list by name
        const peripheral = devices[answers.deviceName];
        connectAndSetUp(peripheral);
    });
}

function connectAndSetUp(peripheral) {

    peripheral.connect(function (error) {

        const serviceUUIDs = [LED_SERVICE_UUID];
        const characteristicUUIDs = [SWITCH_CHARACTERISTIC_UUID, DIMMER_CHARACTERISTIC_UUID];

        peripheral.discoverSomeServicesAndCharacteristics(
            serviceUUIDs,
            characteristicUUIDs,
            onServicesAndCharacteristicsDiscovered);
    });

    peripheral.on('disconnect', () => console.log('disconnected'));
}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {

    if (error) {
        console.log('Error discovering services and characteristics ' + error);
        return;
    }

    const switchCharacteristic = characteristics[0];
    const dimmerCharacteristic = characteristics[1];

    function setSwitch(value) {
        const buffer = new Buffer([0]);
        if (value === 'on') {
            buffer[0] = 1;
        }
        switchCharacteristic.write(buffer, false);
    }

    function setBrightness(byte) {
        if (!dimmerCharacteristic) {
            console.log('This device does not support brightness');
            return;
        }

        const buffer = new Buffer([byte]);
        dimmerCharacteristic.write(buffer, false);
    }

    function ask() {
        inquirer.prompt(questions).then(answers => {
            switch (answers.action) {
                case 'power':
                    setSwitch(answers.switch);
                    break;
                case 'brightness':
                    setBrightness(answers.brightness);
                    break;
                default:
                    process.exit();
            }
            ask(); // recursive
        });    
    };

    ask();

}

const questions = [
    {
        type: 'list',
        name: 'action',
        message: 'Which function?',
        choices: ['Power', 'Brightness', 'Quit'],
        filter: function (val) {
            return val.toLowerCase();
        }
    },
    {
        type: 'list',
        name: 'switch',
        message: 'Switch value',
        choices: ['on', 'off'],
        when: function (answers) {
            return answers.action === 'power';
        }
    },
    {
        type: 'input',
        name: 'brightness',
        message: 'Dimmer setting?',
        validate: function (value) {
            const valid = value >= MIN_BRIGHTNESS && value <= MAX_BRIGHTNESS;
            return valid || `Please enter a value between ${MIN_BRIGHTNESS} and ${MAX_BRIGHTNESS}`;
        },
        filter: Number,
        when: function (answers) {
            return answers.action === 'brightness'
        }
    }
];
