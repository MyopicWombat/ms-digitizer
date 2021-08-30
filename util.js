import {canvas, context, pixelSize, horizontalMarker, threshold, process, xMin, xMax, yAxis, scaleMin, scaleMax, reload, radius} from './gui.js'

let tempImage;

const roundAccurately = (number, decimalPlaces) => Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces)

const averageIntensity = (pixels) => {
  let average = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    average += grey(pixels.slice(i, i + 4));
  }
  average /= (pixels.length / 4);
  return average;
}

function getStartPixel(x, y, width) {
  var start = y * (width * 4) + x * 4;
  return start;
}

const grey = (pixel) => {
  return 255 - (2 * pixel[0] + 5 * pixel[1] + pixel[2]) / 8
}

const convertToScale = (x) => {
  const s1 = Number(scaleMax.value), s2 = Number(scaleMin.value),
  x1 = Number(xMax.value), x2 = Number(xMin.value)
  const m = (s1 - s2) / (x1 - x2);
  const b = (s1 - (m * x1));
  return m * x + b;
}

const convertFromScale = (x) => {
  const s1 = Number(scaleMax.value), s2 = Number(scaleMin.value),
  x1 = Number(xMax.value), x2 = Number(xMin.value)
  const m = (x1 - x2) / (s1 - s2);
  const b = (x1 - (m * s1));
  return m * x + b;

}

const storeImage = () => {
  tempImage = context.getImageData(0, 0, canvas.width, canvas.height);
}

const redrawImage = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.putImageData(tempImage, 0, 0);
}

const drawMarkers = () => {
  context.beginPath()

  context.moveTo(0, horizontalMarker.value);
  context.lineTo(canvas.width, horizontalMarker.value);


  context.moveTo(0, yAxis.value);
  context.lineTo(canvas.width, yAxis.value);

  context.moveTo(xMin.value, 0);
  context.lineTo(xMin.value, canvas.height);

  context.moveTo(xMax.value, 0);
  context.lineTo(xMax.value, canvas.height);

  context.strokeStyle = '#0000FF';
  context.stroke();
}

const drawLines = (list) => {
  list.forEach(element => {
    // element.x = convertFromScale(element.x);

    // context.beginPath();

    // context.moveTo(element.x, 0);
    // context.lineTo(element.x, canvas.height);

    // context.strokeStyle = '#FF0000';
    // context.stroke();

    context.beginPath();

    context.moveTo(element.x, Number(yAxis.value));
    context.lineTo(element.x, element.y);
    // context.moveTo(element.x, 0);
    // context.lineTo(element.x, element.y);


    context.strokeStyle = '#FF0000';
    context.stroke();
  });
}

export {roundAccurately, averageIntensity, getStartPixel, grey, convertToScale, convertFromScale, storeImage, redrawImage, drawMarkers, drawLines};