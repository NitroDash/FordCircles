const KEY_CODES = {
    "SPACE": 32,
    "UP": 38,
    "DOWN": 40,
    "LEFT": 37,
    "RIGHT": 39,
    "SHIFT": 16,
    "ENTER": 13,
    "W": 87,
    "A": 65,
    "S": 83,
    "D": 68
}

class KeyListener {
    constructor(code, id) {
        this.code = code;
        this.id = id;
        this.holdDuration = 0;
        this.down = false;
    }
    
    onKeyDown() {
        this.down = true;
    }
    
    onKeyUp() {
        this.down = false;
    }
    
    update() {
        if (this.down) {
            this.holdDuration++;
        } else {
            this.holdDuration = 0;
        }
    }
    
    isDown() {
        return this.holdDuration > 0;
    }
    
    isPressed() {
        return this.holdDuration == 1;
    }
}

class KeyListenerGroup {
    constructor() {
        this.keysByID = {};
        this.keysByCode = {};
        this.keys = [];
        
        window.addEventListener("keydown", this.onKeyDown.bind(this), false);
        window.addEventListener("keyup", this.onKeyUp.bind(this), false);
    }
    
    bind(code, id) {
        let newKey = new KeyListener(code, id);
        this.keysByID[id] = this.keysByID[id] || [];
        this.keysByID[id].push(newKey);
        this.keysByCode[code] = this.keysByCode[code] || [];
        this.keysByCode[code].push(newKey);
        this.keys.push(newKey);
    }
    
    onKeyDown(evt) {
        let keyList = this.keysByCode[evt.keyCode];
        if (keyList) {
            evt.preventDefault();
            for (let i = 0; i < keyList.length; i++) {
                keyList[i].onKeyDown();
            }
        }
    }
    
    onKeyUp(evt) {
        let keyList = this.keysByCode[evt.keyCode];
        if (keyList) {
            evt.preventDefault();
            for (let i = 0; i < keyList.length; i++) {
                keyList[i].onKeyUp();
            }
        }
    }
    
    update() {
        for (let i = 0; i < this.keys.length; i++) {
            this.keys[i].update();
        }
    }
    
    isDown(id) {
        let keyList = this.keysByID[id];
        if (!keyList) {
            if (DEBUG_CRASH_ON_ERROR) throw Error(`Tried to read from nonexistent key binding "${id}"`);
            if (DEBUG_WARN_ON_ERROR) console.warn(`Tried to read from nonexistent key binding "${id}"`);
            return false;
        }
        for (let i = 0; i < keyList.length; i++) {
            if (keyList[i].isDown()) return true;
        }
        return false;
    }
    
    isPressed(id) {
        let keyList = this.keysByID[id];
        if (!keyList) {
            if (DEBUG_CRASH_ON_ERROR) throw Error(`Tried to read from nonexistent key binding "${id}"`);
            if (DEBUG_WARN_ON_ERROR) console.warn(`Tried to read from nonexistent key binding "${id}"`);
            return false;
        }
        for (let i = 0; i < keyList.length; i++) {
            if (keyList[i].isPressed()) return true;
        }
        return false;
    }
}

var keys = new KeyListenerGroup();

function mouse() {
    var m = {};
    m.x = 0;
    m.y = 0;
    m.down = [];
    m.clicked = [];
    m.updatePosition = function(evt) {
        this.x = evt.clientX;
        this.y = evt.clientY;
        evt.preventDefault();
    }
    m.click = function(evt) {
        this.down[evt.button] = true;
        this.clicked[evt.button] = true;
        evt.preventDefault();
        return false;
    }
    m.up = function(evt) {
        this.down[evt.button] = false;
        evt.preventDefault();
        return false;
    }
    m.resetClicked = function() {
        this.clicked = [];
    }
    window.addEventListener("mousemove", m.updatePosition.bind(m), false);
    window.addEventListener("mousedown", m.click.bind(m), false);
    window.addEventListener("mouseup", m.up.bind(m), false);
    window.addEventListener("contextmenu", event => event.preventDefault(), false);
    return m;
}

function touch(canvas) {
    var t = {};
    t.touches = [];
    
    t.getIdIndex = function(id) {
        for (let i = 0; i < t.touches.length; i++) {
            if (t.touches[i].id == id) return i;
        }
        return -1;
    }
    
    t.touch = function(evt) {
        evt.preventDefault();
        touchMode = true;
        startImageLoad("touchcircle");
        for (let i = 0; i < evt.changedTouches.length; i++) {
            let newTouch = evt.changedTouches.item(i);
            this.touches.push({id: newTouch.identifier, x: newTouch.clientX, y: newTouch.clientY, isNew: true});
        }
    }
    
    t.move = function(evt) {
        evt.preventDefault();
        for (let j = 0; j < evt.changedTouches.length; j++) {
            let newTouch = evt.changedTouches.item(j);
            for (let i = 0; i < this.touches.length; i++) {
                if (this.touches[i].id == newTouch.identifier) {
                    this.touches[i].x = newTouch.clientX;
                    this.touches[i].y = newTouch.clientY;
                    break;
                }
            }
        }
    }
    
    t.end = function(evt) {
        evt.preventDefault();
        for (let j = 0; j < evt.changedTouches.length; j++) {
            let endTouch = evt.changedTouches.item(j);
            for (let i = 0; i < this.touches.length; i++) {
                if (this.touches[i].id == endTouch.identifier) {
                    this.touches.splice(i,1);
                    break;
                }
            }
        }
    }
    
    canvas.addEventListener("touchstart", t.touch.bind(t), false);
    canvas.addEventListener("touchmove", t.move.bind(t), false);
    canvas.addEventListener("touchend", t.end.bind(t), false);
    canvas.addEventListener("touchcancel", t.end.bind(t), false);
    
    return t;
}

var newClicks = [];
var movementDir = null;
var touchMode = false;

class TouchJoystick {
    constructor(isLeft, isTop, size, imageId) {
        this.isLeft = isLeft;
        this.isTop = isTop;
        this.rad = size;
        this.imageId = imageId;
        this.touchId = null;
        startImageLoad(imageId);
    }
    
    update() {
        if (t.getIdIndex(this.touchId) < 0) {
            for (let i = 0; i < t.touches.length; i++) {
                if (t.touches[i].isNew && this.contains(new Vector(t.touches[i].x,t.touches[i].y))) {
                    this.touchId = t.touches[i].id;
                    t.touches[i].isNew = false;
                    break;
                }
            }
            if (t.getIdIndex(this.touchId) < 0) {
                this.touchId = null;
            }
        }
    }
    
    getX() {
        return this.isLeft ? this.getRadius() : canvas.width - this.getRadius();
    }
    
    getY() {
        return this.isTop ? this.getRadius() : canvas.height - this.getRadius();
    }
    
    getPos() {
        return new Vector(this.getX(), this.getY());
    }
    
    getRadius() {
        return Math.max(canvas.width, canvas.height) * this.rad;
    }
    
    getInput() {
        if (t.getIdIndex(this.touchId) >= 0) {
            let touchLoc = t.touches[t.getIdIndex(this.touchId)];
            let v = (new Vector(touchLoc.x,touchLoc.y)).minus(this.getPos());
            v.mult(1/this.getRadius());
            return v;
        }
        return null;
    }
    
    contains(pt) {
        return this.getPos().minus(pt).mag() <= this.getRadius();
    }
    
    render(ctx) {
        if (image[this.imageId]) {
            ctx.globalAlpha = 0.7;
            ctx.drawImage(image[this.imageId], this.getX() - this.getRadius(), this.getY() - this.getRadius(), this.getRadius() * 2, this. getRadius() * 2);
            ctx.globalAlpha = 1;
        }
    }
}

var joysticks;