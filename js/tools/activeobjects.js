var controllerContainer = document.querySelector(".controllerContainer");
var objectCreatorSelect = document.querySelector(".objectCreator-select");
var objectCreatorButton = document.querySelector(".objectCreator-button");
var activeObjectsContainer = document.querySelector(".activeObjectsContainer");

objectCreatorButton.addEventListener("click", () => {
    if (objectCreatorSelect.value == "text") {
        var teroppuText = new Text("文字", teroppuRect.top, teroppuRect.left, styles[0], 'Text');
    } else if (objectCreatorSelect.type == "rect") {

    } else if (objectCreatorSelect.type == "image") {

    }
});
class Layer {
    constructor(fabricObject) {
        this.fabricObject = fabricObject;
        this.name = fabricObject.name;
        this.visible = true;
        this.locked = false;
        this.type = fabricObject.type;
        this.createLayer();
    }

    createLayer() {
        var layerDiv = document.createElement("div");
        layerDiv.classList.add("layer");
        layerDiv.innerHTML = this.type + " - " + this.name;
        this.layerDiv = layerDiv;
        this.createButtons();
        activeObjectsContainer.prepend(layerDiv);
    }

    createButtons() {
        var visButton = document.createElement("button");
        visButton.innerHTML = "V";
        visButton.addEventListener("click", () => this.toggleVisibility());
        this.layerDiv.appendChild(visButton);

        var lockButton = document.createElement("button");
        lockButton.innerHTML = "L";
        lockButton.addEventListener("click", () => this.toggleLock());
        this.layerDiv.appendChild(lockButton);

        var upButton = document.createElement("button");
        upButton.innerHTML = "Up";
        upButton.addEventListener("click", () => this.moveUp());
        this.layerDiv.appendChild(upButton);

        var downButton = document.createElement("button");
        downButton.innerHTML = "Down";
        downButton.addEventListener("click", () => this.moveDown());
        this.layerDiv.appendChild(downButton);
    }

    toggleVisibility() {
        this.visible = !this.visible;
        this.fabricObject.set('opacity', this.visible);
        this.toggleLock();
        canvas.requestRenderAll();
    }


    toggleLock() {
        this.locked = !this.locked;
        this.fabricObject.set({
            lockMovementX: this.locked,
            lockMovementY: this.locked,
            hasControls: !this.locked
        });
        canvas.requestRenderAll();
    }

    moveUp() {
        this.fabricObject.bringForward();
        canvas.requestRenderAll();
    }

    moveDown() {
        this.fabricObject.sendBackwards();
        canvas.requestRenderAll();
    }
}
activeObjects.forEach(function (obj) {
    layers.push(new Layer(obj));
});
