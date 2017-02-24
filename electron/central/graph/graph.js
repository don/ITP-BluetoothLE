// Copied from Tom Igoe's Running Graph example
// https://github.com/tigoe/GraphingSketches/tree/master/RunningGraph
// Modified to run in Electron and read data from Bluetooth LE

var readings = [];            // array to hold raw sensor readings
var lastReading = 0.0;        // last mapped sensor reading (for graphing)
var minValue = -1.5;          // minimum sensor value. Adjust to fit your needs
var maxValue = 1.5;           // maximum sensor value. Adjust to fit your needs

function setup() {
  createCanvas(800, 600);             // set the canvas size
}

function draw() {
  var thisReading;    // current reading being plotted
  var thisAverage;    // current average being plotted
  var xPos;           // current x position

   // clear the background:
  background(0);
  // iterate over the width of the canvas:
  for (xPos = 0; xPos < width; xPos++) {
    // if the array is longer than the canvas is wide,
    // only plot the last <width> elements of the array:
    if (readings.length > width) {
      // get the current reading and average:
      thisReading = readings[readings.length - width + xPos];
    } else {
      // if the array is shorter than the width of the canvas,
      // then xPosition = array position:
      thisReading = readings[xPos];
    }

    // map the current reading and average to the canvas height:
    var readingY = height - map(thisReading, minValue, maxValue, 0, height);
    // only draw if you've the xPosition > 0:
    if (xPos > 0) {
      // blue for the reading:
      stroke(0, 127, 255);
      line(xPos - 1, lastReading, xPos, readingY);
     }

    // if the array is at least twice the width of the canvas,
    // start deleting elements from the front of the array
    // to save memory:
    if (readings.length > width * 2) {
      readings.shift();   // delete the first element in the array
    }

    // save the current reading and average as the starting point
    // for the line in the next iteration:
    lastReading = readingY;
  }
}
