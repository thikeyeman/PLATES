var controllerContainer = document.querySelector(".controllerContainer");
var objectCreatorSelect = document.querySelector(".objectCreator-select");
var objectCreatorButton = document.querySelector(".objectCreator-button");
var activeObjectsContainer = document.querySelector(".activeObjectsContainer");
var rectangle, teroppuText;
var loadedItem = false;
var j = 0;
let styleNames = ['BlueLetterTelop', 'RedLetterTelop', 'PurpleLetterTelop', 'BlackLetterTelop', 'BrownLetterTelop', 'BlueLetterSide', 'RedLetterSide', 'BlackLetterSide', 'BrownLetterSide', 'RedHeadline', 'NG1Green', 'NG2shadow'];
objectCreatorButton.addEventListener("click", () => {
    if (objectCreatorSelect.value != "") {
        if (objectCreatorSelect.value === "text") {
            teroppuText = new Textgroup("", canvas.getCenter().left, screenHeight - 50, 0, 1, 1, 'Textgroup');
            updateLayers();
        } else if (objectCreatorSelect.value === "rect") {
            rectangle = new Rectangle(canvas.getCenter().left, canvas.getCenter().top, 1, 1, '#ff0000', 'Rectangle');
            updateLayers();
        } else if (objectCreatorSelect.value === "image") {
            imageUploadInput.click();
        }
		
    }
});

var loadedItemSize = 0;

function updateLayers() {
    var newObject = activeObjects[activeObjects.length - 1];
    var newLayer = new Layer(newObject);
    newLayer.index = layers.length;
    layers.push(newLayer);
    activeObjectsContainer.prepend(newLayer.layerDiv);
    canvas.renderAll();
}
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
        const layerDiv = document.createElement("div");
        layerDiv.id = 'layer-' + this.name;
        layerDiv.classList.add("layer");
        const layerTypeName = document.createElement("div");

        layerTypeName.classList.add("layerTypeName");
        layerTypeName.innerHTML = this.type + " - ";
        const layerName = document.createElement("input");
        layerName.type = "text";
        layerName.placeholder = "レイヤー名";
        layerDiv.prepend(layerName);
        /*layerDiv.prepend(layerTypeName);*/
        layerName.classList.add("layerName");
        layerName.addEventListener('change', (event) => {
            const newName = event.target.value;
            this.fabricObject.set({
                name: newName
            });
            this.name = newName;
            layerName.value = this.name;
        });

        this.layerDiv = layerDiv;
        this.createButtons();
        /*activeObjectsContainer.prepend(layerDiv);*/
        this.handleSelection();
    }


    handleSelection() {
        this.fabricObject.on("selected", () => {
            this.layerDiv.style.backgroundColor = "#26453D";
        });
        this.fabricObject.on("deselected", () => {
            this.layerDiv.style.backgroundColor = "";
        });
    }

    addButton(buttonClass, buttonText, buttonEvent) {
        var button = document.createElement("button");
        button.classList.add(buttonClass);
        button.classList.add("btn");
        /*button.innerHTML = buttonText;*/
        button.addEventListener("click", buttonEvent);
        this.layerDiv.appendChild(button);
        return button;
    }

    createButtons() {
        var visButton = this.addButton("visButton", "V", () => this.toggleVisibility());
        visButton.addEventListener('click', function () {
            visButton.style.backgroundImage = this.visible == true ? "" : 'url("img/icons/nonvisible.svg")';
            visButton.style.backgroundColor = this.visible == true ? "" : 'black';
            this.visible = !this.visible;
        });

        var lockButton = this.addButton("lockButton", "L", () => this.toggleLock());
        lockButton.addEventListener('click', function () {
            lockButton.style.backgroundImage = this.locked == true ? "" : 'url("img/icons/locked.svg")';
            lockButton.style.backgroundColor = this.locked == true ? "" : 'black';
            this.locked = !this.locked;
        });
        var upButton = this.addButton("upButton", "↑", () => this.moveUp());
        var downButton = this.addButton("downButton", "↓", () => this.moveDown());
        var deleteButton = this.addButton("deleteButton", "delete", () => this.delete());

        var animationSelect = document.createElement("select");
        animationSelect.classList.add("animationSelect");
        var defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.innerHTML = "--Animation--";
        animationSelect.appendChild(defaultOption);
        for (let animationName in animationController.animations) {
            var animationOption = document.createElement("option");
            animationOption.value = animationName;
            animationOption.innerHTML = animationName;
            animationSelect.appendChild(animationOption);
        }
        this.layerDiv.appendChild(animationSelect);

        var runAnimationButton = this.addButton("runAnimationButton", "再生", () => animationController.runAnimation(this.fabricObject, animationSelect.value));


        if (this.type == "group") {
            var textContentInput = document.createElement("textarea");
            textContentInput.classList.add("text-content");
            textContentInput.value = this.fabricObject._objects[0].text;
			textContentInput.placeholder = "ここにテロップ内容を書いてください。";
            textContentInput.addEventListener("input", () => {
                textContentInput.style.height = "";
                textContentInput.style.height = (textContentInput.scrollHeight) + "px";
                for (var i = 0; i < this.fabricObject._objects.length; i++) {
                    this.fabricObject._objects[i].text = textContentInput.value;
                }
                this.fabricObject.set({
                    height: this.fabricObject._objects[0].height,
                    width: Math.min(this.fabricObject._objects[0].width, 480)
                });
                canvas.renderAll();
            });

            var styleSelect = document.createElement("select");
            styleSelect.classList.add("styleSelect");
            styleSelect.classList.add("btn");
            for (let i = 0; i < styles.length; i++) {
                var styleOption = document.createElement("option");
                styleOption.value = i;
                styleOption.innerHTML = styleNames[i];
                styleSelect.appendChild(styleOption);
            }
            styleSelect.addEventListener("change", () => {
                this.fabricObject.styleIndex = styleSelect.selectedIndex;
                var selectedIndex = styleSelect.selectedIndex;
                this.fabricObject._objects[2].set(styles[selectedIndex]);
                this.fabricObject._objects[1].set(shadowStyles[selectedIndex]);
                this.fabricObject._objects[0].set(shadow2Styles[selectedIndex]);
                canvas.renderAll();
            });
            this.layerDiv.appendChild(styleSelect);
            /*var textFileButton = this.addButton("textFileButton", "TXT", () => this.textFileUpload());*/
            this.layerDiv.appendChild(textContentInput);

        }

        if (this.type === "rect") {
            var colorInput = document.createElement("input");
            colorInput.type = "color";
            colorInput.classList.add("colorInput");
            var colorInputHex = document.createElement("input");
            colorInputHex.type = "text";
            colorInputHex.classList.add("colorInputHex");
            colorInputHex.value = this.fabricObject.fill;
            colorInput.value = colorInputHex.value;

            colorInput.addEventListener("input", () => {
                colorInputHex.value = colorInput.value;
                this.fabricObject.set("fill", colorInputHex.value);
                canvas.renderAll();
            });
            colorInputHex.addEventListener("input", () => {
                colorInput.value = colorInputHex.value;
                this.fabricObject.set("fill", colorInput.value);
                canvas.renderAll();
            });
            this.layerDiv.appendChild(colorInput);
            this.layerDiv.appendChild(colorInputHex);
        }

        if (this.type == "image") {
            /*var srcButton = this.addButton("srcButton", "src", () => this.changeImg());*/
        }
    }

    toggleVisibility() {
        this.visible = !this.visible;
        this.fabricObject.set('opacity', this.visible);
        canvas.requestRenderAll();
    }


    toggleLock() {
        this.locked = !this.locked;
        this.fabricObject.set({
            lockMovementX: this.locked,
            lockMovementY: this.locked,
            hasControls: !this.locked,
            selectable: !this.locked
        });
        canvas.requestRenderAll();
    }

    moveUp() {
        this.fabricObject.bringForward();
        var currentIndex = Array.prototype.indexOf.call(activeObjectsContainer.children, this.layerDiv);
        var layerIndex = layers.indexOf(this);
        if (currentIndex > 0) {
            activeObjectsContainer.insertBefore(this.layerDiv, activeObjectsContainer.children[currentIndex - 1]);
            layers.splice(layerIndex, 1);
            layers.splice(layerIndex + 1, 0, this);
        }
        canvas.requestRenderAll();
    }

    moveDown() {
        this.fabricObject.sendBackwards();
        var currentIndex = Array.prototype.indexOf.call(activeObjectsContainer.children, this.layerDiv);
        var layerIndex = layers.indexOf(this);
        if (currentIndex < activeObjectsContainer.children.length - 1) {
            activeObjectsContainer.insertBefore(this.layerDiv, activeObjectsContainer.children[currentIndex + 2]);
            layers.splice(layerIndex, 1);
            layers.splice(layerIndex - 1, 0, this);
        }
        canvas.requestRenderAll();
    }


    delete() {
        canvas.remove(this.fabricObject);
        this.layerDiv.remove();
        canvas.requestRenderAll();

        const index = activeObjects.indexOf(this.fabricObject);
        if (index !== -1) {
            activeObjects.splice(index, 1);
        }

        const layerIndex = layers.indexOf(this);
        if (layerIndex !== -1) {
            layers.splice(layerIndex, 1);
        }
    }
    changeImg() {
        var imageSrcInput = document.createElement("input");
        imageSrcInput.type = "file";
        imageSrcInput.accept = "image/*";
        imageSrcInput.click();
        let that = this;
        imageSrcInput.onchange = function (e) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var src = e.target.result;
                that.fabricObject._element.src = src;
                that.delete();
            };
            reader.readAsDataURL(e.target.files[0]);
        };

    }
}
