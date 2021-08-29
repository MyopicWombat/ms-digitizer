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

const roundAccurately = (number, decimalPlaces) => Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces)

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
  console.log(xMin.value);
  console.log(xMax.value);
  const x1 = Number(xMin.value), x2 = Number(xMax.value)
  for (let x = x1; x < x2; x++) {
    console.log(x);
    center = checkPixel(x, y, size);
    console.log(center);

    if (center) {
      //y = getApex(x,y,size);
      let scaled = convertToScale(center);
      peakList.push(roundAccurately(scaled,1));
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
    context.lineTo(element, canvas.height);

    context.strokeStyle = '#FF0000';
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
  const s1 = Number(scaleMax.value), s2 = Number(scaleMin.value),
    x1 = Number(xMax.value), x2 = Number(xMin.value)
  const m = (s1 - s2) / (x1 - x2);
  const b = (s1 - (m * x1));
  return m * x + b;
}

const converFromScale = (x) => {
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

image.src = './IMG_4980.JPG';