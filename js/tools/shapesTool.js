class Rectangle extends fabric.Rect {
  constructor(x, y, scaleX, scaleY, fill, name) {
    super({
      left: x,
      top: y,
      scaleX: scaleX,
      scaleY: scaleY,
      fill: fill,
      name: name,
      width: 50,
      height: 50,
      className: 'Rectangle',
      originX: 'center',
      originY: 'center'
    });
  }

  toObject() {
    return fabric.util.object.extend(super.toObject(), {
      name: this.name,
      className: this.className
    });
  }
}
