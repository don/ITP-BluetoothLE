# Electron

Cross platform apps with Node.js built with HTML and JavaScript. Basically runs a custom browser with Node.js.

http://electron.atom.io/

NW.js is another project with similar goals http://nwjs.io/

## npm packages with native code

npm packages with native code, like bleno and noble, need to be [recompiled to work with Electron](https://github.com/atom/electron/blob/master/docs/tutorial/using-native-node-modules.md#how-to-install-native-modules).

    npm install --save-dev electron-rebuild
    ./node_modules/.bin/electron-rebuild

The example projects have a script in package.json to rebuild with electron-rebuild run `npm run rebuild`.

[Examples](../electron)

 - [LED](../electron/led) (also controls the Robosmart light)
 - [Button](../electron/button)
 - [Thermometer](../electron/thermometer)
 - [P5 - Button](../electron/p5-button)
 - [SensorTag / Graph](../electron/graph)

For all the examples

    $ npm install
    $ npm run rebuild
    $ npm start
    
## More info

For more info checkout the [Electron Quckstart](http://electron.atom.io/docs/latest/tutorial/quick-start/)

 

