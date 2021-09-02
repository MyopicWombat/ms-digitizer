//gui elements
import { canvas, context, pixelSize, apexWidth, apexHeight, horizontalMarker, threshold, process, xMin, xMax, yAxis, scaleMin, scaleMax, reload, radius, helpButton } from './gui.js'
console.log(canvas);

//utility functions
import { roundAccurately, averageIntensity, grey, convertToScale, storeImage, redrawImage, drawMarkers, drawLines, mostIntensePixel, drawPath, copyToClipboard } from './util.js';

//global variables
let fileloaded = false;

let mouseState = {
  button: -1,
  shift: false
}

//event handlers

const markerMove = () => {
  if(fileloaded){
    processMS();
  }
}

const mouseMarkers = (e) => {
  if (mouseState.button > -1) {
    let { x, y } = getCoords(e);
    if (mouseState.alt) {
      redrawImage();
      let rad = Number(radius.value);
      context.beginPath();
      context.arc(x, y, rad, 0, 2 * Math.PI, false);
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

//processing image
const processMS = () => {
  redrawImage();
  const y = Number(horizontalMarker.value);
  const size = Number(pixelSize.value);
  const apexFindWidth = Number(apexWidth.value);
  const apexFindHeight = Number(apexHeight.value);

  let list = getIntensitiesOnMarker(y, size);
  list = firstDerivativeFilter(list);
  list = refineCenter(list, y, size);
  list = findApex(list, y, apexFindWidth, apexFindHeight);
  drawLines(list);
  drawMarkers();
  return list.map(element => {
    return {
      x: roundAccurately(convertToScale(element.x), 1),
      y: Number(yAxis.value) - element.y
    }
  })
}

const getIntensitiesOnMarker = (y, size) => {
  const list = [];
  const x1 = Number(xMin.value), x2 = Number(xMax.value)
  for (let x = x1; x < x2; x += size) {
    let pixels = context.getImageData(x, y, size, -2).data;
    let darkest = mostIntensePixel(pixels, size);
    list.push({
      x: darkest.x + x,
      y: darkest.i
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
  console.log(list)
  const refined = [];

  for (let i = 0; i < list.length; i++) {
    let left = list[i].x;
    let right = list[i].x;
    let intensity = list[i].y;

    let pi = left;
    let pixel = 255;

    while (pi <= list[i].x + size * 2 && pixel > intensity / 2) {
      right = pi;
      pi++;
      pixel = grey(context.getImageData(pi, y, 1, -1).data);
    }

    pi = right;
    while (pi >= list[i].x - size * 2 && pixel > intensity / 2) {
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
  console.log(refined);
  return refined;
}



const findApex = (list, yStart, sizeX, sizeY) => {
  const apexes = [];
  for (let i = 0; i < list.length; i++) {
    let aboveThreshold = true;

    let max = {
      x: list[i].x,
      y: yStart,
      i: 0
    };
    let y = yStart;
    let counter = 0;
    while (aboveThreshold && counter < canvas.height) {
      counter++;
      y -= sizeY;

      let width = sizeX * 2 + 1
      let prevMax = { ...max };
      max = mostIntensePixel(context.getImageData(max.x - sizeX, y, width, -sizeY).data, width)
      max.x = max.x + prevMax.x - sizeX;
      max.y = max.y + y;
      aboveThreshold = max.i > Number(threshold.value);

    }

    apexes.push({
      x: list[i].x,
      y: max.y
    })
  }
  return apexes;
}


//set up image
// const image = new Image();



// // image.src = './test.png';
// image.src = './IMG_4980.JPG';

//event handlers

const image = new Image();
image.onload = () => {
  canvas.width = image.width;
  canvas.height = image.height;
  horizontalMarker.max = canvas.height;
  horizontalMarker.value = canvas.height - image.height * 0.04;
  xMin.max = canvas.width;
  xMin.value = image.width * 0.01;

  xMax.max = canvas.width;
  xMax.value = canvas.width - image.width * 0.01;

  yAxis.max = canvas.height;
  yAxis.value = canvas.height - image.height * 0.03;
  context.save();
  context.drawImage(image, 0, 0);
  context.restore();
  storeImage();
  drawMarkers();
}


function handleImage(e) {
  var reader = new FileReader();
  reader.onload = function (event) {
    fileloaded = true;
    image.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
}

document.getElementById('files').onchange = handleImage;

//can't use arrow functions when this is called as this refers to the parent object from an
//arrow function instead of the caller.
helpButton.onclick = function () {
  this.classList.toggle('active');
  let content = this.nextElementSibling;
  content.classList.toggle('hidden');
}

process.onclick = () => {
  const processed = processMS();
  const output = document.getElementById('output');
  output.innerHTML = processed.reduce((acc, cur) => {
    return acc + `<div>${cur.x}, ${cur.y}</div>`;
  }, '');
  copyToClipboard(processed.reduce((acc, cur) => {
    return acc + `${cur.x}, ${cur.y}\n`;
  }, ''))

};

reload.onclick = () => {
  context.drawImage(image, 0, 0);
  storeImage();
  markerMove();
}

horizontalMarker.oninput =
  xMin.oninput =
  xMax.oninput =
  yAxis.oninput =
  threshold.oninput =
  pixelSize.oninput =
  apexWidth.oninput =
  apexHeight.oninput =
  markerMove;

canvas.onmousewheel = (e) => {
  if (e.altKey) {
    e.preventDefault();
    let t = Number(threshold.value) + (e.wheelDelta / 60);
    threshold.value = t;
    markerMove();
  }
}

canvas.onmousedown = (e) => {
  mouseState.button = e.button;
  mouseState.shift = e.shiftKey;
  mouseState.alt = e.altKey;
}

canvas.oncontextmenu = (e) => {
  e.preventDefault();
}

canvas.onmouseup = (e) => {
  mouseMarkers(e);
  if (mouseState.alt) {
    markerMove()
  };
  mouseState.button = -1;
  mouseState.shift = false;
  mouseState.alt = false;
}

canvas.onmousemove = (e) => {
  mouseMarkers(e);
}