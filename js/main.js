var canvas, ctx;

var center = 0.5;
var width = 2.2;
var height = 1;
var pixelScale = 1;

var left, right;

const DEBUG_RNG_SEED = null;
const DEBUG_CRASH_ON_ERROR = true;
const DEBUG_WARN_ON_ERROR = true;

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    keys.bind(KEY_CODES.LEFT, "left");
    keys.bind(KEY_CODES.RIGHT, "right");
    keys.bind(KEY_CODES.UP, "out");
    keys.bind(KEY_CODES.DOWN, "in");
    requestAnimationFrame(updateAndRender);
}

function updateAndRender() {
    update();
    render();
    requestAnimationFrame(updateAndRender);
}

const ZOOM_SPEED = 1.01;
const PAN_SPEED = 0.01;

function update() {
    keys.update();
    if (keys.isDown("out")) width /= 1.01;
    if (keys.isDown("in")) width *= 1.01;
    if (keys.isDown("left")) center -= width*PAN_SPEED;
    if (keys.isDown("right")) center += width*PAN_SPEED;
}

function render() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    height = width * canvas.height/canvas.width;
    pixelScale = canvas.width/width;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.font = "20px sans-serif";
    left = center-width/2;
    right = center+width/2;
    drawFordCircle(0,1);
    drawFordCircle(1,1);
    drawCircleInterval(0,1, 1,1);
}

function drawCircleInterval(a1,b1, a2,b2) {
    if (a1/b1 > right) return;
    if (a2/b2 < left) return;
    b = b1+b2;
    if (pixelScale < 2*b*b) return;
    a = a1+a2;
    if (a/b + 1/(2*b*b) >= left && a/b - 1/(2*b*b) <= right) drawFordCircle(a,b);
    drawCircleInterval(a1,b1,a1+a2,b1+b2);
    drawCircleInterval(a1+a2,b1+b2,a2,b2);
}

function drawFordCircle(a, b) {
    x = pixelScale * ((a/b)-center) + (canvas.width/2);
    r = 1/(2 * b * b);
    y = canvas.height - r*pixelScale;
    drawCircle(x, y, r*pixelScale);
    if (r*pixelScale > 20) {
        var widthPerDigit = Math.floor(r*pixelScale*2/Math.ceil(Math.log10(b+1))/4);
        ctx.font = widthPerDigit + "px sans-serif";
        var numWidth = Math.max(ctx.measureText(a+"").width, ctx.measureText(b+"").width);
        numWidth += widthPerDigit/5;
        var barHeight = widthPerDigit/10;
        ctx.fillRect(x-numWidth/2, y-barHeight/2, numWidth, barHeight);
        ctx.textBaseline = "bottom";
        ctx.fillText(a+"", x, y-barHeight);
        ctx.textBaseline = "top";
        ctx.fillText(b+"", x, y+barHeight);
    }
}

function drawCircle(cx, cy, radius) {
    ctx.beginPath();
    ctx.arc(cx,cy,radius,0,6.3);
    ctx.stroke();
}

init();