const canvas = document.getElementById('imageCanvas');
const context = document.getElementById('imageCanvas').getContext('2d');
const pixelSize = document.getElementById('pixelSize');
const apexWidth = document.getElementById('apexWidth');
const apexHeight = document.getElementById('apexHeight');
const horizontalMarker = document.getElementById('horizontalMarker');
const threshold = document.getElementById('threshold');
const process = document.getElementById('process');
const xMin = document.getElementById('xMin');
const xMax = document.getElementById('xMax');
const yAxis = document.getElementById('yAxis');
const scaleMin = document.getElementById('scaleMin');
const scaleMax = document.getElementById('scaleMax');
const reload = document.getElementById('reload');
const radius = document.getElementById('radius');

export {canvas, context, pixelSize, horizontalMarker, threshold, process, xMin, xMax, yAxis, scaleMin, scaleMax, reload, radius, apexWidth, apexHeight}