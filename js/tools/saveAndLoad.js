'use strict';

const profileSelector = document.querySelector('.profile-select');
const jsonUploadInput = document.querySelector('#project-upload');
let sceneLoading = false;

function notify(message, error = false) {
  const status = document.querySelector('#status');
  status.textContent = message;
  status.classList.toggle('error', error);
}

function captureScene() {
  const objects = canvas.toObject().objects;
  return {
    version: 1,
    width: screenWidth,
    height: screenHeight,
    objects,
    layers: canvas.getObjects().map((object, index) => ({
      name: object.name,
      index,
      visible: object.visible,
      locked: Boolean(object.lockMovementX && object.lockMovementY)
    })),
    savedStackOrders: objects.map((_, index) => index)
  };
}

function serializeScene() {
  const text = JSON.stringify(captureScene());
  SceneData.parse(text);
  return text;
}

function saveCanvas(profileName) {
  try {
    localStorage.setItem(`plates:${profileName}`, serializeScene());
    notify(`Saved ${profileName.replace('profile', 'Profile ')} in this browser. Export JSON for a portable backup.`);
    return true;
  } catch (error) {
    notify(`Could not save: ${error.message} Existing saved data has been kept. Try exporting JSON.`, true);
    return false;
  }
}

function enlivenScene(entries) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      settled = true;
      reject(new Error('An image took too long to load.'));
    }, 15000);
    try {
      const descriptions = entries.map(({ object }) => {
        if (object.className === 'Textgroup' && !object.objects) {
          const text = new Textgroup(object.content, object.left ?? 480, object.top ?? 490,
            object.styleIndex, object.scaleX ?? 1, object.scaleY ?? 1, object.name);
          return { ...text.toObject(), ...object };
        }
        return object;
      });
      fabric.util.enlivenObjects(descriptions, objects => {
        if (settled) {
          objects.forEach(object => object.dispose?.());
          return;
        }
        settled = true;
        clearTimeout(timer);
        if (objects.length !== entries.length) {
          objects.forEach(object => object.dispose?.());
          reject(new Error('One or more images could not be decoded.'));
          return;
        }
        try {
          objects.forEach((object, index) => {
            const description = entries[index].object;
            const prototypes = { Textgroup, Rectangle, ImageCustom };
            Object.setPrototypeOf(object, prototypes[description.className].prototype);
            object.set({
              name: description.name,
              className: description.className,
              visible: description.visible,
              lockMovementX: entries[index].locked,
              lockMovementY: entries[index].locked,
              lockRotation: entries[index].locked,
              lockScalingX: entries[index].locked,
              lockScalingY: entries[index].locked,
              hasControls: !entries[index].locked,
              selectable: !entries[index].locked
            });
            if (object.type === 'group') {
              object.styleIndex = description.styleIndex;
              object.setControlsVisibility({ ml: false, mr: false, mt: false, mb: false });
            }
            if (object.type === 'image' && object.width * object.height > SceneData.LIMITS.imagePixels) {
              throw new Error('An image exceeds the 16 megapixel limit.');
            }
            object.setCoords();
          });
          resolve(objects);
        } catch (error) {
          objects.forEach(object => object.dispose?.());
          reject(error);
        }
      });
    } catch (error) {
      settled = true;
      clearTimeout(timer);
      reject(error);
    }
  });
}

async function restoreScene(text) {
  if (sceneLoading) return false;
  const disabled = Array.from(document.querySelectorAll('button, input, select, textarea'))
    .map(element => [element, element.disabled]);
  const interaction = { selection: canvas.selection, skipTargetFind: canvas.skipTargetFind };
  sceneLoading = true;
  disabled.forEach(([element]) => { element.disabled = true; });
  canvas.selection = false;
  canvas.skipTargetFind = true;
  notify('Loading project…');
  try {
    const entries = SceneData.parse(text);
    const objects = await enlivenScene(entries);
    const nextLayers = objects.map(object => new Layer(object));
    const previousObjects = canvas.getObjects().slice();
    const previousLayers = layers;
    canvas.discardActiveObject();
    canvas.renderOnAddRemove = false;
    try {
      canvas.remove(...previousObjects);
      canvas.add(...objects);
      activeObjects = objects;
      layers = nextLayers;
      syncLayerOrder();
    } catch (error) {
      canvas.remove(...objects);
      canvas.add(...previousObjects);
      activeObjects = previousObjects;
      layers = previousLayers;
      activeObjectsContainer.replaceChildren(...previousLayers.map(layer => layer.layerDiv).reverse());
      objects.forEach(object => object.dispose?.());
      throw error;
    } finally {
      canvas.renderOnAddRemove = true;
      canvas.requestRenderAll();
    }
    if (typeof stopAllAnimations === 'function') stopAllAnimations();
    previousObjects.forEach(object => object.dispose?.());
    notify(`Loaded ${objects.length} object${objects.length === 1 ? '' : 's'}.`);
    return true;
  } catch (error) {
    notify(`Could not load: ${error.message} Your current scene has been kept.`, true);
    return false;
  } finally {
    sceneLoading = false;
    Object.assign(canvas, interaction);
    disabled.forEach(([element, wasDisabled]) => { if (element.isConnected) element.disabled = wasDisabled; });
  }
}

async function loadCanvas(profileName) {
  try {
    const text = localStorage.getItem(`plates:${profileName}`) ?? localStorage.getItem(profileName);
    if (text === null) {
      notify('This profile has not been saved yet. Your current scene has been kept.', true);
      return false;
    }
    return await restoreScene(text);
  } catch (error) {
    notify(`Could not read browser storage: ${error.message} Your current scene has been kept.`, true);
    return false;
  }
}

document.querySelector('.load-file-button').addEventListener('click', () => jsonUploadInput.click());

document.querySelector('.save-button').addEventListener('click', () => saveCanvas(profileSelector.value));
document.querySelector('.load-button').addEventListener('click', () => loadCanvas(profileSelector.value));
document.querySelector('.save-file-button').addEventListener('click', () => {
  try {
    const url = URL.createObjectURL(new Blob([serializeScene()], { type: 'application/json' }));
    const link = document.createElement('a');
    link.download = `${profileSelector.value}.json`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Exported project JSON. Keep this file as a portable backup.');
  } catch (error) { notify(`Could not export: ${error.message}`, true); }
});

jsonUploadInput.addEventListener('change', async function () {
  const file = this.files[0];
  this.value = '';
  if (!file) return;
  if (file.size > SceneData.LIMITS.bytes) {
    notify('Project files must be at most 10 MiB. Your current scene has been kept.', true);
    return;
  }
  try { await restoreScene(await file.text()); }
  catch (error) { notify(`Could not read file: ${error.message} Your current scene has been kept.`, true); }
});


async function loadExample(startup = false) {
  if (sceneLoading) return false;
  if (!startup && canvas.getObjects().length && !window.confirm('Replace the current scene with the example? Export JSON first if you want to keep your work.')) return false;
  const sceneAtRequest = activeObjects;
  try {
    const response = await fetch('examples/starter-scene.json');
    if (!response.ok) throw new Error('The bundled example could not be read.');
    const text = await response.text();
    if (startup && (sceneLoading || activeObjects !== sceneAtRequest)) return false;
    return await restoreScene(text);
  } catch (error) { notify(`Could not load example: ${error.message}`, true); return false; }
}

document.querySelector('.example-button').addEventListener('click', () => loadExample());
document.querySelector('.clear-button').addEventListener('click', async () => {
  if (sceneLoading) return;
  if (canvas.getObjects().length && !window.confirm('Clear the canvas? Saved profiles are kept. Export JSON first to keep unsaved edits.')) return;
  if (await restoreScene('{"objects":[]}')) notify('Canvas cleared. Saved profiles have been kept.');
});

const starterReady = loadExample(true);
