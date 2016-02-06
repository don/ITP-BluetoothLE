## ITP Bluetooth LE - Software for Week 2

## PhoneGap

We are using [PhoneGap](http://phonegap.com/) to write mobile apps for iOS and Android. PhoneGap requires Node.js.

 * Download Node.js 4.2.4 from [https://nodejs.org/](https://nodejs.org/).
 * Run the Node.js installer.

Use `npm` (which is included with Node.js) to install PhoneGap.

### Mac

Mac users, open Terminal.app and run

    sudo npm install -g phonegap

Mac users might be prompted to install the XCode or the command line developer tools. It's OK to install these, but it's faster if you choose **Not Now**.

### Windows

Windows users, open cmd.exe and run

	npm install -g phonegap

### Linux

Linux users, open terminal and run

    npm install -g phonegap

### Verify

Verify that PhoneGap installed correctly. Run `phonegap -v` and ensure that it prints out the version number. You're OK as long as your version number is greater than 5.4.0.

```
$ phonegap -v
5.5.0
```

## Firewall

The `phonegap serve` command opens a socket on port 3000. If your laptop has a fire wall, ensure that port 3000 is open.


## Text editor

You're going to need a text editor. I recommend installing Atom, but you can use another editor if you have a favorite.

 * Download Atom.io from [https://atom.io/](https://atom.io/).  
 * Mac users should drag Atom.app to /Applications.
 * Windows users should run the installer.
 * Linux users should install the deb or rpm

## jshint

`jshint` is a tool we will use to find errors in JavaScript code.

Install jshint with npm.

    npm install -g jshint

Mac and Linux users may need to use sudo

    sudo npm install -g jshint

If you installed the Atom editor, you should install the atom-jshint plugin.

    apm install atom-jshint

## PhoneGap Developer App

Phone, iPod and iPads users should install the [PhoneGap Developer App](https://itunes.apple.com/app/id843536693) from the App Store.

Android users should install [PhoneGap Developer App](https://play.google.com/store/apps/details?id=com.adobe.phonegap.app) from Google Play.

## Optional

PhoneGap developer app is great for quickly creating and testing apps, but it requires a server running on your laptop. The same code the you create with PhoneGap developer app can be used to create standalone apps with PhoneGap or Cordova.

    npm install -g cordova

Creating iOS applications requires a Mac and XCode. Android applications can be developed on any platform. Follow the instructions from the Corodva website.

 * [iOS Platform Guide](http://cordova.apache.org/docs/en/6.0.0/guide/platforms/ios/index.html)
 * [Android Platform Guide](http://cordova.apache.org/docs/en/6.0.0/guide/platforms/android/index.html)
