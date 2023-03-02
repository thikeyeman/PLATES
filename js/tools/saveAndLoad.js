var profileSelector = document.querySelector(".profile-select");
var saveButton = document.querySelector(".save-button");
var loadButton = document.querySelector(".load-button");
var saveFileButton = document.querySelector(".save-file-button");
var jsonUploadInput = document.createElement("input");
jsonUploadInput.type = "file";
jsonUploadInput.accept = ".json";
let i = 0;
let savedStackOrders = [];
let loadedStackOrders = [];
let loadedLayerStates = [];

function saveCanvas(profileName) {
  savedStackOrders = [];
  i = 0;
  savedStackOrders = activeObjects.map((obj) => canvas.getObjects().indexOf(obj));
  const data = {
    objects: [],
    layers: [],
    savedStackOrders: savedStackOrders
  };

  activeObjects.forEach(function (obj) {
    const exported = obj.toObject();
    data.objects.push(exported);
  });
  layers.forEach(function (layer) {
    data.layers.push({
      name: layer.name,
      index: layer.index,
      visible: layer.visible,
      locked: layer.locked
    });
  });
  localStorage.setItem(profileName, JSON.stringify(data));

}


function loadCanvas(profileName) {
  canvas.clear();
  canvas.backgroundColor = "#00ff00";
  activeObjectsContainer.innerHTML = "";
  activeObjects = [];
  layers = [];
  loadedStackOrders = [];
  i = 0;
  const data = JSON.parse(localStorage.getItem(profileName));
  if (data.savedStackOrders) {
    loadedStackOrders = data.savedStackOrders;
  }
  if (data.layers) {
    data.layers.forEach(function (layer) {
      loadedLayerStates.push(layer);
    });
  }

  data.objects.forEach(function (item) {
    const className = item.className;
    reviver(item);
  });

  setTimeout(sortDOMLayers, 1);
}


saveButton.addEventListener('click', function () {
  let profileName = profileSelector.value;
  saveCanvas(profileName);
});

loadButton.addEventListener('click', function () {
  let profileName = profileSelector.value;
  loadCanvas(profileName);
});

saveFileButton.addEventListener('click', function () {
  let profileName = profileSelector.value;
  savedStackOrders = [];
  i = 0;
  savedStackOrders = activeObjects.map((obj) => canvas.getObjects().indexOf(obj));
  const data = {
    objects: [],
    layers: [],
    savedStackOrders: savedStackOrders
  };

  activeObjects.forEach(function (obj) {
    const exported = obj.toObject();
    data.objects.push(exported);
  });
  layers.forEach(function (layer) {
    data.layers.push({
      name: layer.name,
      index: layer.index,
      visible: layer.visible,
      locked: layer.locked
    });
  });

  let blob = new Blob([JSON.stringify(data)], {
    type: "application/json"
  });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.download = profileName + ".json";
  a.href = url;
  a.click();
});

jsonUploadInput.addEventListener('change', function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.onload = function () {
    canvas.clear();
    canvas.backgroundColor = "#00ff00";
    activeObjectsContainer.innerHTML = "";
    activeObjects = [];
    layers = [];
    loadedStackOrders = [];
    i = 0;
    const data = JSON.parse(reader.result);
    if (data.savedStackOrders) {
      loadedStackOrders = data.savedStackOrders;
    }
    if (data.layers) {
      data.layers.forEach(function (layer) {
        loadedLayerStates.push(layer);
      });
    }

    data.objects.forEach(function (item) {
      const className = item.className;
      reviver(item);
    });

    setTimeout(sortDOMLayers, 1);
  };
  reader.readAsText(file);
});

function reviver(dataItem) {
  if (dataItem.className === "Textgroup") {
    const teroppuText = new Textgroup(
      dataItem.content,
      dataItem.left,
      dataItem.top,
      dataItem.styleIndex,
      dataItem.scaleX,
      dataItem.scaleY,
      dataItem.name
    );
    teroppuText.moveTo(loadedStackOrders[i]);
    i++;
    updateLayers();
  } else if (dataItem.className === "Rectangle") {
    const rectangle = new Rectangle(
      dataItem.left,
      dataItem.top,
      dataItem.scaleX,
      dataItem.scaleY,
      dataItem.fill,
      dataItem.name
    );
    rectangle.moveTo(loadedStackOrders[i]);
    i++;
    updateLayers();
  } else if (dataItem.className === "ImageCustom") {
    var image = new Image();
    image.src = dataItem.src;
    image.onload = function () {
      var img = new ImageCustom(image, dataItem.left, dataItem.top, dataItem.scaleX, dataItem.scaleY, dataItem.name);
      img.moveTo(loadedStackOrders[i]);
      i++;
      updateLayers();
    }
  }
}

function sortDOMLayers() {
  var parentElement = document.querySelector(".activeObjectsContainer");
  var childElements = Array.from(parentElement.children);
  var newPositionArray = loadedStackOrders.reverse();
  const childObjects = [];
  for (let i = 0; i < childElements.length; i++) {
    childObjects.push({
      element: childElements[i],
      position: newPositionArray[i]
    });
  }
  childObjects.sort((a, b) => a.position - b.position);
  for (let i = 0; i < childObjects.length; i++) {
    parentElement.prepend(childObjects[i].element);
  }
}
