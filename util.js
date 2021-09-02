import { canvas, context, horizontalMarker, xMin, xMax, yAxis, scaleMin, scaleMax, radius } from './gui.js'

export const roundAccurately = (number, decimalPlaces) => Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces)

export const averageIntensity = (pixels) => {
  let average = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    average += grey(pixels.slice(i, i + 4));
  }
  average /= (pixels.length / 4);
  return average;
}

export const mostIntensePixel = (pixels, width) => {
  //returns the darkest grey pixel from the pixels array
  let vector = { x: 0, y: 0, i: 0 };
  for (let i = 0; i < pixels.length; i += 4) {
    let cur = grey(pixels.slice(i, i + 4));
    if (cur > vector.i) {
      if (width) {
        vector = getXYFromIndex(i, width);
      }
      vector.i = cur;
    }
  }
  return (width && vector) || vector.i;
}

export const getXYFromIndex = (startNum, width) => {
  //get x y coords from an index in an ImageData array with known width
  let vector = {};
  let pixelNum = startNum / 4;
  vector.y = Math.floor(pixelNum / width);
  vector.x = pixelNum % width;
  return vector;
}

export function getStartPixel(x, y, width) {
  //get index of a pixel from x y coords in an ImageData array
  var start = y * (width * 4) + x * 4;
  return start;
}

export const grey = (pixel) => {
  //dirty greyscale conversion inverted to make threshold more sensible
  //0 is white, 255 is black
  return Math.floor(255 - (2 * pixel[0] + 5 * pixel[1] + pixel[2]) / 8)
}

export const convertToScale = (x, pixelStart, scaleStart, pixelEnd, scaleEnd) => {
  //get the scaled x coordinate from a pixel value when given the pixel to scale conversions
  const s1 = Number(scaleMax.value), s2 = Number(scaleMin.value),
    x1 = Number(xMax.value), x2 = Number(xMin.value)
  const m = (s1 - s2) / (x1 - x2);
  const b = (s1 - (m * x1));
  return m * x + b;
}

export const convertFromScale = (x, pixelStart, scaleStart, pixelEnd, scaleEnd) => {
  //get the pixel x coordinate from a scaled x coordinate when give the scale conversions
  const s1 = Number(scaleMax.value), s2 = Number(scaleMin.value),
    x1 = Number(xMax.value), x2 = Number(xMin.value)
  const m = (x1 - x2) / (s1 - s2);
  const b = (x1 - (m * s1));
  return m * x + b;

}

export const storeImage = () => {
  context.savedImage = context.getImageData(0, 0, canvas.width, canvas.height);;
}

export const redrawImage = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.putImageData(context.savedImage, 0, 0);
}

export const drawMarkers = () => {
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

export const drawLines = (list) => {
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

export const drawPath = (list) => {
  context.beginPath();
  context.moveTo(list[0].x, list[0].y);
  for (let i = 0; i < list.length; i++) {
    console.log(list[i])
    context.lineTo(list[i].x, list[i].y);
  }
  context.strokeStyle = '#FF0000';
  context.stroke();
}

export const copyToClipboard = str => {
  //https://www.30secondsofcode.org/js/s/copy-to-clipboard
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
};