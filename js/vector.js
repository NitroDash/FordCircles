class Vector {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    
    copy() {
        return new Vector(this.x, this.y);
    }
    
    equals(v) {
        return this.x == v.x && this.y == v.y;
    }
    
    dot(v) {
        return this.x*v.x +this.y*v.y;
    }
    
    cross(v) {
        return this.x*v.y - this.y*v.x;
    }
    
    unsignedAngleWith(v) {
        return Math.acos(this.dot(v)/(this.mag() * v.mag()));
    }
    
    angleOf() {
        if (this.x == 0 && this.y == 0) {
            return 0;
        }
        let theta = Math.acos(this.x/this.mag());
        if (this.y < 0) {
            theta *= -1;
        }
        return theta;
    }
    
    magSquared() {
        return this.x*this.x + this.y*this.y;
    }
    
    mag() {
        return Math.sqrt(this.magSquared());
    }
    
    unitize() {
        this.setLength(1);
    }
    
    setLength(l) {
        l /= this.mag();
        this.mult(l);
    }
    
    mult(m) {
        this.x *= m;
        this.y *= m;
    }
    
    times(m) {
        return new Vector(this.x * m, this.y * m);
    }
    
    minus(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    
    plus(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    
    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
    }
    
    add(v) {
        this.x += v.x;
        this.y += v.y;
    }
    
    unitPerp() {
        let v = new Vector(-this.y,this.x);
        v.unitize();
        return v;
    }
    
    parallelComponent(v) {
        return v.times(this.dot(v)/v.magSquared());
    }
    
    perpendicularComponent(v) {
        return this.minus(this.parallelComponent(v));
    }
}

/*class Rectangle {
    constructor(x,y,w,h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    
    translate(x,y) {
        this.x += x;
        this.y += y;
    }
    
    intersects(other) {
        return other.x <= this.x + this.w && this.x <= other.x + other.w && other.y <= this.y + this.h && this.y <= other.y + other.h;
    }
    
    contains(point) {
        return point.x >= this.x && point.y >= this.y && point.x <= this.x + this.w && point.y <= this.y + this.h;
    }
    
    getCenter() {
        return new Vector(this.x + this.w/2, this.y + this.h/2);
    }
    
    ejectVector(other) {
        if (!this.intersects(other)) return new Vector(0,0);
        let centerDist = other.getCenter().minus(this.getCenter());
        let horiz = (centerDist.x > 0) ? (this.x + this.w) - other.x : this.x - (other.x + other.w);
        let vert = (centerDist.y > 0) ? (this.y + this.h) - other.y : this.y - (other.y + other.h);
        return (Math.abs(horiz) > Math.abs(vert)) ? new Vector(0,vert) : new Vector(horiz,0);
    }
}*/