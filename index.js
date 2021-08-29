const canvas = document.getElementById('imageCanvas');
const context = document.getElementById('imageCanvas').getContext('2d');
const pixelSize = document.getElementById('pixelSize');
const horizontalMarker = document.getElementById('horizontalMarker');
const threshold = document.getElementById('threshold');
const process = document.getElementById('process');
const xMin = document.getElementById('xMin');
const xMax = document.getElementById('xMax');
const scaleMin = document.getElementById('scaleMin');
const scaleMax = document.getElementById('scaleMax');

const markerMove = () => {
  redrawImage();
  drawMarkers();
}

horizontalMarker.oninput = markerMove;
xMin.oninput = markerMove;
xMax.oninput = markerMove;




process.onclick = (e) => {
  redrawImage();
  const y = horizontalMarker.value;
  const size = Number(pixelSize.value);

  let center;
  const peakList = [];

  for (let x = xMin.value; x < xMax.value; x++) {

    center = checkPixel(x, y, size);
    if (center) {
      //y = getApex(x,y,size);
      let scaled = convertToScale(center);
      peakList.push(Math.round(scaled));
      x = center + size;
      console.log(x)
    }

  }
  console.log(peakList);
  drawLines(peakList);
  drawMarkers();
}

const drawLines = (xList) => {
  xList.forEach(element => {
    element = converFromScale(element);
    context.beginPath();

    context.moveTo(element, 0);
    context.lineTo(element,canvas.height);

    context.stroke();
  });
}


const checkPixel = (x, y, size) => {
  let pixel = getGreyPixel(x, y, size);
  if (pixel > threshold.value) {
    return 0;
  }
  let min = {
    x,
    value: 255
  };
  for (let i = x; i < x + (size * 2); i++) {
    if (pixel < min.value) {
      min.value = pixel;
      min.x = i;
    }
  }
  return min.x

}

const getGreyPixel = (x, y, size) => {
  let pixelData = context.getImageData(x, y - size, 1, size).data
  let average = 0;
  for (let i = 0; i < pixelData.length; i += 4) {
    average += (2 * pixelData[i + 0] + 5 * pixelData[i + 1] + pixelData[i + 2]) / 8
  }
  average /= (pixelData.length / 4);
  return average;
}

const convertToScale = (x) => {
  const m = (scaleMax.value- scaleMin.value) / (xMax.value - xMin.value);
  const b = (scaleMax.value - (m * xMax.value));
  return m*x+b;
}

const converFromScale = (x) => {
  const m = (xMax.value - xMin.value)/(scaleMax.value- scaleMin.value);
  const b = (xMax.value - (m * scaleMax.value));
  return m*x+b;

}

const image = new Image();

image.onload = () => {
  canvas.width = image.width;
  canvas.height = image.height;
  horizontalMarker.max = canvas.height;
  xMin.value = 0;
  xMin.max = canvas.width;

  xMax.max = canvas.width;
  xMax.value = canvas.width;

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

  context.moveTo(xMin.value, 0);
  context.lineTo(xMin.value, canvas.height);

  context.moveTo(xMax.value, 0);
  context.lineTo(xMax.value, canvas.height);

  context.stroke();
}

image.src = './test.png';