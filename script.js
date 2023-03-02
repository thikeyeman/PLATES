var c = document.querySelector('canvas');

const screenWidth = 960;
const screenHeight = 540;


var canvas = new fabric.Canvas(c, {
  width: screenWidth,
  height: screenHeight,
  backgroundColor: "#00ff00"
});

let activeObjects = [];
let layers = [];

var subCanvasInstance = new fabric.Canvas('sub-canvas');

let newWindow = null;

function openSubCanvas() {
  if (newWindow == null || newWindow.closed) {
    newWindow = window.open("", "SubCanvas", "width=" + (screenWidth) + ",height=" + (screenHeight));
    newWindow.document.write("<canvas id='subCanvas'></canvas>");
    newWindow.document.documentElement.style.cursor = "none";
    var subCanvas = newWindow.document.querySelector("#subCanvas");
    subCanvas.style.border = "1px solid black";
    subCanvas.style.userSelect = "none";
    subCanvas.style.webkitUserSelect = "none";
    subCanvas.style.pointerEvents = "none";
    let body = newWindow.document.querySelector("body");
    body.style.margin = "0";
    body.style.padding = "0";
    body.style.transform = "scale(0.96)";
    subCanvasInstance = new fabric.Canvas(subCanvas, {
      width: screenWidth,
      height: screenHeight
    });


    subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));

    document.querySelector(".dispSub-button").innerHTML = "Update Sub";

    newWindow.addEventListener("beforeunload", function () {
      newWindow = null;
      document.querySelector(".dispSub-button").innerHTML = "Show Sub";
    });
    newWindow.document.addEventListener('keydown', function (e) {
      if ((e.key === 'r' || e.keyCode === 116) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
      }
    });

  } else {
    subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
  }

  newWindow.addEventListener("resize", function () {
    updateZoom(newWindow);
  });
}


function updateZoom(newWindow) {
  let subWindowWidth = newWindow.innerWidth;
  let subWindowHeight = subWindowWidth * (screenHeight / screenWidth);
  let zoom = subWindowWidth / screenWidth;
  subCanvasInstance.setZoom(zoom);
  subCanvasInstance.setWidth(subWindowWidth);
  subCanvasInstance.setHeight(subWindowHeight);
  subCanvasInstance.renderAll();
}

var realTimeMode = document.querySelector(".realTime-mode");
realTimeMode.addEventListener("change", () => {
  if (realTimeMode.checked) {
    canvas.on('object:modified', function () {
      subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
    });

    canvas.on('after:render', function () {
      subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
    });
  } else {
    canvas.off('object:modified');
    canvas.off('after:render');
  }
});


function hide() {
  if (document.querySelector(".activeObjectsContainer").style.display === "none") {
    document.querySelector(".activeObjectsContainer").style.display = "block";
  } else {
    document.querySelector(".activeObjectsContainer").style.display = "none";
  }
}
document.querySelector(".canvasScale-input").addEventListener("input", function () {
  var canvasScale = document.querySelector(".canvasScale-input").value;
  document.querySelector(".canvasContainer").style.transform = "translateX(-25%) scale(" + canvasScale + ")";;
});


canvas.on('object:moving', function (options) {
  var obj = options.target;
  var canvasCenter = canvas.getCenter();
  var distanceX = obj.left - canvasCenter.left;
  var snapDistance = 30;
  if (Math.abs(distanceX) < snapDistance) {
    obj.set({
      left: canvasCenter.left
    });
  }
});
