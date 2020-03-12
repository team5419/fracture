/* eslint-disable */
const $ = window.$ = window.jQuery = require('jquery');
require('jquery-ui-dist/jquery-ui');
const Pose2d = require('./math/Pose2d.js');
const Translation2d = require('./math/Translation2d.js');
const Rotation2d = require('./math/Rotation2d.js');
const QuinticHermiteSpline = require('./math/QuinticHermiteSpline.js');

let waypoints = []; let imagePoints = []; let splinePoints = []; let velocities = [];
let ctx, ctxBackground, image, imageFlipped, wto, dragingPoint;
let animating = false;

const zoom = 3

const fieldWidth = 50; //feet
const fieldHeight = 27; // feet
const topX = 52; const topY = 30;

const width = 5670/zoom; // pixels
const height = 2286/zoom; // pixels
const xOffset = 0;
const yOffset = 0;

const robotWidth = 1; // meters
const robotHeight = 1; // meters

const waypointRadius = 7;
const splineWidth = 2;
const pi = Math.PI;
const pointsPerSpline = 100;
const clickToleranceRadius = 30 //pixels

/**
 * Converts coordinates relative to the full picture to coordinates relative to field
 *
 * @param mX X-coordinate
 * @param mY Y-coordinate
 * @returns coords coordinates list of x, y
 */
function getAboluteCoords(point){
  return new Translation2d({

  })
}

function getMousePos(evt) {
  
  return new Translation2d(
    
  );
}

/**
 * Converts coordinates relative to the field to coordinates relative to full picture
 *
 * @param mX X-coordinate
 * @param mY Y-coordinate
 * @returns coordinates list of x, y
 */

function getFullCoords(mX, mY){
  let x = mX + 162;
  let y = -1 * mY + 256;
  let coords = [x, y]
  return (coords);
}

function d2r(d) {
  return d * (Math.PI / 180);
}

function r2d(r) {
  return r * (180 / Math.PI);
}

let animation;

/**
 * Draws the generated path without reloading the points
 */

 function animate() {
  drawSplines(false, true);
}

/**
 * Draws to canvas
 *
 * @param {number} style specifies what to draw: 1 is waypoints only, 2 is waypoints + splines, and 3 is the animation
 */

function draw(style) {
  clear();
  drawWaypoints();
  switch (style) {
    case 1:
      break;
    case 2:
      drawSplines(true);
      drawSplines(false);
      break;
    case 3:
      animate();
      break;
    default:
      break;
  }
}

/**
 * Draws 4 points on the vertices of the bounding box of the robot
 *
 * @param position list of x, y
 * @param heading angle in degrees
 */

function drawRobot(position, heading) {
  const h = heading;
  const angles = [h + (pi / 2) + t, h - (pi / 2) + t, h + (pi / 2) - t, h - (pi / 2) - t];
  imagePoints = [];
  angles.forEach((angle) => {
    const point = new Translation2d(
      position.translation.x + (r * Math.cos(angle)),
      position.translation.y + (r * Math.sin(angle))
    );
    imagePoints.push(point);
    point.draw(Math.abs(angle - heading) < pi / 2 ? '#00AAFF' : '#0066FF', splineWidth, ctx);
  });
}

/**
 * Fills path with velocity-dependent color
 *
 * @param position Pose2d list of generated points
 * @param heading angle in degrees
 * @param color hue: rgba
 */

function fillRobot(position, heading, color) {
  const previous = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'destination-over';

  const translation = position.translation;

  ctx.translate(translation.drawX, translation.drawY);
  ctx.rotate(-heading);

  const w = robotWidth * (width / fieldWidth);
  const h = robotHeight * (height / fieldHeight);
  ctx.fillStyle = color || 'rgba(0, 0, 0, 0)';
  ctx.fillRect(-h / 2, -w / 2, h, w);

  ctx.rotate(heading);
  ctx.translate(-translation.drawX, -translation.drawY);

  ctx.globalCompositeOperation = previous;
}

/**
 * Draws generated path. Can animate or update
 *
 * @param {boolean} fill
 * @param {boolean} animate
 */

function drawSplines(fill, animate) {
  const maxVel = Math.max(...velocities)
  const minVel = Math.min(...velocities)
  animate = animate || false;
  let i = 0;

  if (animate) {
    clearInterval(animation);

    animation = setInterval(() => {
      if (i >= splinePoints.length) {
        animating = false;
        clearInterval(animation);
        return;
      }

      animating = true;

      const splinePoint = splinePoints[i];
      // const hue = Math.round(180 * (i++ / splinePoints.length));

      const hue = Math.round(180 * (-velocities[i] + maxVel) / (maxVel - minVel));

      const previous = ctx.globalCompositeOperation;
      // fillRobot(splinePoint, splinePoint.rotation.getRadians(), `hsla(${hue}, 100%, 50%, 0.025)`);
      ctx.globalCompositeOperation = 'source-over';
      // drawRobot(splinePoint, splinePoint.rotation.getRadians());
      splinePoint.draw(false, splineWidth, ctx);
      ctx.globalCompositeOperation = previous;

      i++;
    }, 25);
  } else {
    splinePoints.forEach((splinePoint) => {
      // splinePoint.draw(false, splineWidth, ctx);
      
      if (fill) {
        const hue = Math.round(180 * (-velocities[i] + maxVel) / (maxVel - minVel));
        // fillRobot(splinePoint, splinePoint.rotation.getRadians(), `hsla(${hue}, 100%, 50%, 0.025)`);
      } else {
        // drawRobot(splinePoint, splinePoint.rotation.getRadians());
      }
      i++;
    });
  }
}

/**
 * Draws user-inputed waypoints using drawRobot()
 */

function drawWaypoints() {
  waypoints.forEach((waypoint) => {
    waypoint.draw(true, waypointRadius, ctx);
    drawRobot(waypoint, waypoint.rotation.getRadians());
  });
}

/**
 * Run when points are updated,
 * pushes new points to waypoints and redraws the path
 * @var {Array} splinePoints generated Pose2d points
 */


function update() {
  if (animating) {
    return;
  }

  tempPoints = [];
  $('tbody').children('tr').each(function () {
    const x = parseInt($($($(this).children()).children()[0]).val());
    const y = parseInt($($($(this).children()).children()[1]).val());
    let heading = parseInt($($($(this).children()).children()[2]).val());
    if (isNaN(heading)) {
      heading = 0;
    }
    const enabled = ($($($(this).children()).children()[3]).prop('checked'));
    
    heading = heading / 180 * Math.PI
    
    if (enabled) {
      waypoint = new Pose2d(new Translation2d(x, y), Rotation2d.fromRadians(heading), $(this))
      tempPoints.push(waypoint);
    }

    waypoints = tempPoints
  });


  draw(1);

  splinePoints = [];
  splines = [];
  for(i = 0; i < waypoints.length - 1; i++) {
    splines.push(new QuinticHermiteSpline(waypoints[i], waypoints[i+1]))
  }

  splines.forEach(spline => {
    for(i = 0.0; i < 1; i += 1/pointsPerSpline){
      velocities.push(spline.getVelocity(i))
      splinePoints.push(new Pose2d(spline.getPoint(i), Rotation2d.fromRadians(spline.getHeading(i))))
    }
  })


  splinePoints.pop();

  draw(2);
}


const r = Math.sqrt((robotWidth ** 2) + (robotHeight ** 2)) / 2;
const t = Math.atan2(robotHeight, robotWidth);

/**
 * Delays before updating
 */

function rebind() {
  const change = 'propertychange change click keyup input paste';
  const input = $('input');
  input.unbind(change);
  input.bind(change, () => {
    clearTimeout(wto);
    wto = setTimeout(() => {
      update();
    }, 500);
  });
}

function init() {
  const field = $('#field');
  const background = $('#background');
  const canvases = $('#canvases');
  const widthString = `${width / 1.5}px`;
  const heightString = `${height / 1.5}px`;

  field.css('width', widthString);
  field.css('height', heightString);
  background.css('width', widthString);
  background.css('height', heightString);
  canvases.css('width', widthString);
  canvases.css('height', heightString);

  ctx = document.getElementById('field').getContext('2d');
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#FF0000';
  
  ctxBackground = document.getElementById('background').getContext('2d');
  ctxBackground.canvas.width = width;
  ctxBackground.canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  
  image = new Image();
  image.src = 'img/field.png';
  image.onload = function () {
    ctxBackground.drawImage(image, 0, 0, width, height);
    update();
  };
  imageFlipped = new Image();
  imageFlipped.src = 'img/fieldFlipped.png';
  rebind();

  const rect = canvases[0].getBoundingClientRect();
  
  function getMousePos(event){
    let x = (event.clientX - rect.left) / (rect.right - rect.left) * fieldWidth;
    let y = (event.clientY - rect.bottom) / (rect.top - rect.bottom) * fieldHeight;

    return new Translation2d(x,y)
  }

  canvases.mousedown((event) => {
    update()
        
    // mousePoint = new Translation2d(event.clientX, event.clientY)
    let point = getMousePos(event)
    waypoints.forEach( (waypoint) => {
      if( point.distance(waypoint) < 5) {
        dragingPoint = waypoint;
        console.log(`dragging ${dragingPoint}`)
      }
    })
  })
  canvases.mouseup(() => {dragingPoint = null})
  canvases.mouseleave(() => {dragingPoint = null})
  canvases.mousemove((event) => {
    if(!dragingPoint) return;
    let point = getMousePos(event)
    dragingPoint.setPoint(Math.round(point.x),Math.round(point.y),null)
    update()
  });
}

function getFieldCoords(x,y){
  return new Translation2d(x / width*fieldWidth + xOffset, y / height * fieldHeight + yOffset)
}

let flipped = false;
/**
 * Flips field and updates
 */
function flipField() {
  flipped = !flipped;
  ctx.drawImage(flipped ? imageFlipped : image, 0, 0, width, height);
  update();
}

/**
 * Clears all drawn elements
 */

function clear() {
  ctx = document.getElementById('field').getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#FF0000';

  ctxBackground.clearRect(0, 0, width, height);
  ctxBackground.fillStyle = '#FF0000';
  ctxBackground.drawImage(flipped ? imageFlipped : image, 0, 0, width, height);
}

/**
 * Runs when Add Point is clicked, updates
 */

function addPoint() {

  function updatePoint(point, row) {

  }

  let prev;
  if (waypoints.length > 0) prev = waypoints[waypoints.length - 1].translation;
  else prev = new Translation2d(20, 20);

  let xInput =        $(`<input type='number' value='${prev.x + 5}'>`)
  let yInput =        $(`<input type='number' value='${prev.y + 5}'>`)
  let headingInput =  $(`<input type=\'number\' value=\'0\'>`)
  let enabledInput =  $(`<input type=\'checkbox\' checked>`)
  let deleteInput =   $('<button>&times;</button>');

  deleteInput.click((event) => {
    console.log('click', event)
    $(this).parent().parent().remove();
    update()
    xInput.change();
  })

  xInput.change((event) => {
    console.log("change")
    console.log(event)
    // updatePoint(0, $(this).parent().parent())
  })

  tr = $(`${'<tr>' + "<td class='drag_handler'></td></tr>"}`)
    .append($(`<td class='x'></td>`).append(xInput))
    .append($(`<td class='y'></td>`).append(yInput))
    .append($(`<td class='heading'></td>`).append(headingInput))
    .append($(`<td class='enabled'></td>`).append(enabledInput))
    .append($(`<td class='delete'></td>`).append(deleteInput))

  $('tbody').append(tr)
  update();
  rebind();
}

$(window).ready(init);