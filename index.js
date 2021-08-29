const canvas = document.getElementById('imageCanvas');
const context = document.getElementById('imageCanvas').getContext('2d');
const pixelSize = document.getElementById('pixelSize');
const horizontalMarker = document.getElementById('horizontalMarker');
const threshold = document.getElementById('threshold');
const process = document.getElementById('process');
const xMin = document.getElementById('xMin');
const xMax = document.getElementById('xMax');
const yAxis = document.getElementById('yAxis');
const scaleMin = document.getElementById('scaleMin');
const scaleMax = document.getElementById('scaleMax');


const roundAccurately = (number, decimalPlaces) => Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces)
const markerMove = () => {
  redrawImage();
  drawMarkers();
}

horizontalMarker.oninput = markerMove;
xMin.oninput = markerMove;
xMax.oninput = markerMove;
yAxis.oninput = markerMove;

canvas.onclick = (e) => {
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  console.log("Coordinate x: " + x,
    "Coordinate y: " + y);
  console.log(grey(context.getImageData(x, y, 1, 1).data))

}

process.onclick = (e) => {
  redrawImage();
  const y = Number(horizontalMarker.value);
  const size = Number(pixelSize.value);

  const peakList = [];
  const x1 = Number(xMin.value), x2 = Number(xMax.value)

  for (let x = x1; x < x2; x++) {
    // console.log(x);

    if (checkThreshold(x, y, size)) {
      let center = findHorizontalCenter(x, y, size);
      let apex = findApex(center, y, size);
      let scaled = convertToScale(center);
      peakList.push({
        x: roundAccurately(scaled, 1),
        y: apex
      });
      x = center + size;
    }

  }
  console.log(peakList);
  drawLines(peakList);
  drawMarkers();
}

const checkThreshold = (x, y, size) => {
  //check if a pixel is below the threshold
  let pixelData = context.getImageData(x - (size / 2), y - size, size, size).data;
  for (let i = 0; i < pixelData.length; i += 4) {
    let pixel = grey(pixelData.slice(i, i + 4))
    if (y !== 500) {
      console.log(`(${x}, ${y}): ${pixel}, threshold ${threshold.value}`);
    }
    if (pixel < Number(threshold.value)) {
      return true;
    }
  }
}

const findHorizontalCenter = (x, y, size, offset = 0) => {
  let width = size * 2
  let pixelData = context.getImageData(x - offset, y, width + offset, -size).data;
  let min = {
    x: 0,
    value: 255
  }
  for (let xi = 0; xi < width; xi++) {
    let average = 0;
    for (let yi = 0; yi < size; yi++) {
      let start = getStartPixel(xi, yi, width);
      let pixel = pixelData.slice(start, start + 4);
      average += grey(pixel);
    }
    average /= size;
    if (average < min.value) {
      min.x = xi + x - offset;
      min.value = average;
    }
  }
  console.log(`found best intensity of ${min.value} at ${min.x} from ${x} on row ${y}`)
  return min.x;
}

function getStartPixel(x, y, width) {
  var start = y * (width * 4) + x * 4;
  return start;
}

const findApex = (x, y, size) => {
  let xi = x;
  for (let yi = y - size; yi > 0; yi -= size) {
    xi = findHorizontalCenter(xi, yi, size, size);
    console.log(xi, yi);
    if (!checkThreshold(xi, yi, size)) {
      return yi;
    }
  }
}

const grey = (pixel) => {
  return (2 * pixel[0] + 5 * pixel[1] + pixel[2]) / 8
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

const image = new Image();

image.onload = () => {
  canvas.width = image.width;
  canvas.height = image.height;
  horizontalMarker.max = canvas.height;
  xMin.max = canvas.width;
  // xMin.value = 0;

  xMax.max = canvas.width;
  // xMax.value = canvas.width;

  yAxis.max = canvas.height;
  // yAxis.value = canvas.height;

  redrawImage();
  drawMarkers();
}

const redrawImage = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);
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
    element.x = convertFromScale(element.x);

    context.beginPath();

    context.moveTo(element.x, 0);
    context.lineTo(element.x, canvas.height);

    context.strokeStyle = '#FF0000';
    context.stroke();

    context.beginPath();

    context.moveTo(element.x, Number(yAxis.value));
    context.lineTo(element.x, element.y);

    context.strokeStyle = '#00FF00';
    context.stroke();
  });
}
image.src = './IMG_4980.JPG';