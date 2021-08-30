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
  // redrawImage();
  // drawMarkers();
  processMS();
}

horizontalMarker.oninput = markerMove;
xMin.oninput = markerMove;
xMax.oninput = markerMove;
yAxis.oninput = markerMove;
threshold.oninput = markerMove;
pixelSize.oninput = markerMove;

let mouseState = {
  button: -1,
  shift: false
}

canvas.onmousewheel = (e) => {
  if (e.shiftKey) {
    e.preventDefault();
    let t = Number(threshold.value) + (e.wheelDelta / 60);
    threshold.value = t;
    markerMove();
  }
}

canvas.onmousedown = (e) => {
  console.log(e);
  mouseState.button = e.button;
  mouseState.shift = e.shiftKey;
  mouseState.alt = e.altKey;
}

canvas.oncontextmenu = (e) => {
  e.preventDefault();
}

canvas.onmouseup = (e) => {
  mouseMarkers(e);
  mouseState.button = -1;
  mouseState.shift = false;
}

canvas.onmousemove = (e) => {
  mouseMarkers(e);
}

const mouseMarkers = (e) => {
  if (mouseState.button > -1) {
    let { x, y } = getCoords(e);
    if (mouseState.alt) {
      redrawImage();
      let radius = 10
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI, false);
      context.fillStyle = 'white';
      context.fill();
      context.lineWidth = 0;
      context.strokeStyle = 'white';
      context.stroke();
      storeImage();
      drawMarkers();
      return;
    }
    if (mouseState.button === 0) {
      if (!mouseState.shift) {
        xMin.value = x;
      } else {
        horizontalMarker.value = y;
      }
    } else {
      if (!mouseState.shift) {
        xMax.value = x;
      } else {
        yAxis.value = y;
      }
    }
    markerMove();

  }
}

const getCoords = (e) => {
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  return { x, y }
}


const processMS = () => {
  redrawImage();
  const y = Number(horizontalMarker.value);
  const size = Number(pixelSize.value);

  let list = getIntensitiesOnMarker(y, size);
  list = firstDerivativeFilter(list);
  list = refineCenter(list, y, size);
  list = findApex(list, y, size);
  drawLines(list);
  drawMarkers();
  return list.map(element => {
    return {
      x: roundAccurately(convertToScale(element.x), 1),
      y: Number(yAxis.value) - element.y
    }
  })
}

process.onclick = () => {
  const processed = processMS();
  const output = document.getElementById('output');
  output.innerHTML = processed.reduce((acc, cur) => {
    return acc + `<div>${cur.x}, ${cur.y}</div>`;
  }, '');
};
const getIntensitiesOnMarker = (y, size) => {
  const list = [];
  const x1 = Number(xMin.value), x2 = Number(xMax.value)
  for (let x = x1; x < x2; x++) {
    let pixels = context.getImageData(x, y, size, -size).data;
    let intensity = averageIntensity(pixels);
    list.push({
      x: x,
      y: intensity
    }
    );
  }
  return list;
}

const firstDerivativeFilter = (list) => {
  const filtered = [];
  for (let i = 1; i < list.length - 1; i++) {

    let prev = list[i - 1].y;
    let cur = list[i].y;
    let next = list[i + 1].y;

    let prevDif = cur - prev;
    let curDif = next - cur;

    if ((cur > Number(threshold.value)) && (curDif === 0 || (prevDif > 0 && curDif < 0))) {
      filtered.push(list[i])
    }
  }
  return filtered;
}

const refineCenter = (list, y, size) => {
  const refined = [];

  for (let i = 0; i < list.length; i++) {
    let left = list[i].x;
    let right = list[i].x;
    let intensity = list[i].y;

    let pi = left;
    let pixel = 255;

    while (pi <= list[i].x + size && pixel > intensity / 2) {
      right = pi;
      pi++;
      pixel = grey(context.getImageData(pi, y, 1, -1).data);
    }

    pi = right;
    while (pi >= list[i].x - size && pixel > intensity / 2) {
      left = pi;
      pi--;
      pixel = grey(context.getImageData(pi, y, 1, -1).data);
    }
    let center = (left + right) / 2
    refined.push({
      x: center,
      y: intensity
    })
  }
  // console.log(refined);
  return refined;
}

const findApex = (list, yStart, size) => {
  const apexes = [];

  for (let i = 0; i < list.length; i++) {

    let aboveThreshold = true;


    let max = {
      x: list[i].x,
      i: 0
    };
    let y = yStart;

    let counter = 0;
    while (aboveThreshold && counter < canvas.height) {
      counter++;
      y -= size;
      max.i = 0;
      // console.log('current max', max);
      for (let x = max.x - size; x <= max.x + size; x += size) {
        let intensity = averageIntensity(context.getImageData(x, y, size, size).data)
        // console.log('current intensity', intensity);
        if (intensity > max.i) {
          max = {
            x,
            i: intensity
          }
        }
        // console.log('max after comparison', max)
      }
      // console.log(Number(threshold.value))
      aboveThreshold = max.i > Number(threshold.value);
      // console.log(aboveThreshold);
    }
    apexes.push({
      x: list[i].x,
      y
    })
  }
  return apexes;
}

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

const image = new Image();
let tempImage;
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

  context.drawImage(image, 0, 0);
  storeImage();
  drawMarkers();
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
// image.src = './test.png';
image.src = './IMG_4980.JPG';