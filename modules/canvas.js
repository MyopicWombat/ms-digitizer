import { context } from "../gui";

export class MSImage {
  #canvas;
  #canvasScale = 1;
  #context;
  #savedImage;
  #rulers;

  #processingCanvas;
  constructor(canvas) {
    this.#canvas = canvas;
    this.#context = canvas.getContext('2d')
    this.#processingCanvas = document.createElement('canvas');
  }
  loadImage(image) {

  }
  storeImage() {
    //store a copy of the ImageData to the context
    this.#savedImage = context.getImageData(0, 0, canvas.width, canvas.height);
  }
  addRule(name, orientation, location, color) {
    this.#rulers[name] = {
      orientation,
      location,
      color
    }
  }
  updateRule(name, location) {
    this.#rulers[name] = {
      location,
      color
    }
  }
  deleteRule(name) {
    delete this.#rulers[name];
  }
  drawRules() {
    for (let i = 0; i < this.#rules.length; i++) {

    }
  }
  redrawImage() {
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#context.putImageData(this.#savedImage, 0, 0);
  }
}

export const redrawImage = (context) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.putImageData(context.savedImage, 0, 0);
}

export const drawMarkers = (context, markers) => {
  //takes in an array of marker objects => {loc: integer, type: 'h' || 'v'}
  for (let i = 0; i < markers.length; i++) {
    if (markers[i].type === 'h') {
      drawHorizontalRule(context, markers[i].loc)
    }
  }
}

const drawVerticalRule = (context, x, color = 0) => {
  let height = context.canvas.height;
  drawLine(context, x, 0, x, height, color);
}

const drawHorizontalRule = (context, y, color = 0) => {
  let width = context.canvas.width;
  drawLine(context, 0, y, width, y, color);
}

const drawLine = (context, x1, y1, x2, y2, color = 0) => {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.strokeStyle = color;
  context.stroke();
}