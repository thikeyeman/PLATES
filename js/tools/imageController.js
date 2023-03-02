class ImageCustom extends fabric.Image {
  constructor(imgSrc, x, y, scaleX, scaleY, name) {
    super(imgSrc, {
      left: x,
      top: y,
      name: name,
      scaleX: scaleX,
      scaleY: scaleY,
      className: 'ImageCustom',
      originX: 'center',
      originY: 'center'
    });
    canvas.add(this);
    activeObjects.push(this); // Add the created object to the activeObjects array
  }

  toObject() {
    return fabric.util.object.extend(super.toObject(), {
      name: this.name,
      className: this.className
    });
  }
}

var imageUploadInput = document.createElement("input");
imageUploadInput.type = "file";
imageUploadInput.accept = "image/*";
imageUploadInput.onchange = function (e) {
  var reader = new FileReader();
  reader.onload = function (e) {
    var image = new Image();
    image.src = e.target.result;
    image.onload = function () {
      var img = new ImageCustom(image, screenWidth / 2, screenHeight / 2, 1, 1, "Image");
      if (img.width > 500) {
        img.scaleToWidth(500);
      }
      canvas.renderAll();
      updateLayers();
    }
  }
  reader.readAsDataURL(e.target.files[0]);
}
