import {canvas, context, horizontalMarker, xMin, xMax, yAxis, scaleMin, scaleMax, radius} from './gui.js'

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

const mostIntensePixel = (pixels, width) => {
  // console.log(pixels);
  let vector = {
    x: 0,
    y: 0,
    i: 0
  };
  for (let i = 0; i < pixels.length; i += 4) {
    let cur = grey(pixels.slice(i, i + 4));
    // console.log(cur);
    if (cur > vector.i){
      if(width){
        vector = getXYFromIndex(i,width);
      }
      vector.i = cur;
    }
  }
  if(width){
    return vector;
  }
  return vector.i;
}

const getXYFromIndex = (startNum, width) => {
  let vector = {};
  let pixelNum = startNum /4;
  vector.y = Math.floor(pixelNum/width);
  vector.x = pixelNum % width;
  return vector;
}

function getStartPixel(x, y, width) {
  var start = y * (width * 4) + x * 4;
  return start;
}

const grey = (pixel) => {
  return Math.floor(255 - (2 * pixel[0] + 5 * pixel[1] + pixel[2]) / 8)
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

const drawPath = (list) => {
  context.beginPath();
  context.moveTo(list[0].x, list[0].y);
  for (let i = 0; i < list.length; i++) {
    console.log(list[i])
    context.lineTo(list[i].x, list[i].y);
  }
  context.strokeStyle = '#FF0000';
  context.stroke();
}

export {roundAccurately, averageIntensity, getStartPixel, grey, convertToScale, convertFromScale, storeImage, redrawImage, drawMarkers, drawLines, mostIntensePixel, drawPath};