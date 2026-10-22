'use strict';

const objectCreatorSelect = document.querySelector('.objectCreator-select');
const activeObjectsContainer = document.querySelector('.activeObjectsContainer');
const styleNames = ['Blue outline', 'Red outline', 'Purple outline', 'Black outline',
  'Brown outline', 'Blue fill', 'Red fill', 'Black fill', 'Brown fill',
  'Red shadow', 'Green fill', 'Green shadow'];
const fontOptions = [
  ['Japanese sans serif', "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif"],
  ['Japanese Mincho', "'Yu Mincho', 'Hiragino Mincho ProN', 'MS PMincho', serif"],
  ['Arial / Gothic', "Arial, 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif"],
  ['Georgia / Mincho', "Georgia, 'Yu Mincho', 'Hiragino Mincho ProN', serif"],
  ['Monospace', "'Courier New', 'MS Gothic', monospace"]
];

function registerObject(object) {
  if (sceneLoading) { notify('Please wait for the current project to finish loading.', true); return false; }
  try {
    const candidate = captureScene();
    candidate.objects.push(object.toObject());
    candidate.layers.push({ name: object.name, visible: object.visible, locked: false });
    candidate.savedStackOrders.push(candidate.objects.length - 1);
    SceneData.parse(JSON.stringify(candidate));
    const layer = new Layer(object);
    canvas.add(object);
    layers.push(layer);
    syncLayerOrder();
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
    notify(`Added ${object.name}.`);
    return true;
  } catch (error) {
    object.dispose();
    notify(`Could not add object: ${error.message}`, true);
    return false;
  }
}

function nextName(type) {
  const names = new Set(canvas.getObjects().map(object => object.name));
  let index = 1;
  while (names.has(`${type} ${index}`)) index++;
  return `${type} ${index}`;
}

document.querySelector('.objectCreator-button').addEventListener('click', () => {
  if (sceneLoading) return;
  if (objectCreatorSelect.value === 'text') {
    registerObject(new Textgroup('Your caption / テロップ', screenWidth / 2, screenHeight - 65, 0, 1, 1, nextName('Text')));
  } else if (objectCreatorSelect.value === 'rect') {
    registerObject(new Rectangle(screenWidth / 2, screenHeight / 2, 1, 1, '#ff0000', nextName('Rectangle')));
  } else if (objectCreatorSelect.value === 'image') imageUploadInput.click();
});

function syncLayerOrder() {
  activeObjects = canvas.getObjects().slice();
  const byObject = new Map(layers.map(layer => [layer.fabricObject, layer]));
  layers = activeObjects.map(object => byObject.get(object)).filter(Boolean);
  activeObjectsContainer.replaceChildren(...layers.map(layer => layer.layerDiv).reverse());
  layers.forEach((layer, index) => {
    layer.upButton.disabled = index === layers.length - 1;
    layer.downButton.disabled = index === 0;
  });
}

class Layer {
  constructor(object) {
    this.fabricObject = object;
    this.layerDiv = document.createElement('section');
    this.layerDiv.className = 'layer';
    this.createControls();
    this.refreshState();
    object.on('selected', () => this.layerDiv.classList.add('is-selected'));
    object.on('deselected', () => this.layerDiv.classList.remove('is-selected'));
  }

  get name() { return this.fabricObject.name; }
  get visible() { return this.fabricObject.visible; }
  get locked() { return Boolean(this.fabricObject.lockMovementX && this.fabricObject.lockMovementY); }

  button(parent, className, label, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `${className} iconButton`;
    if (className === 'stopAnimationButton') button.textContent = '↺';
    button.title = label;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', handler);
    parent.append(button);
    return button;
  }

  field(labelText, element) {
    const label = document.createElement('label');
    label.className = 'fieldLabel';
    label.append(document.createTextNode(labelText), element);
    this.layerDiv.append(label);
  }

  createControls() {
    const object = this.fabricObject;
    const header = document.createElement('div');
    header.className = 'layerHeader';
    const name = document.createElement('input');
    name.type = 'text';
    name.className = 'layerName';
    name.value = object.name;
    name.maxLength = 200;
    name.setAttribute('aria-label', 'Layer name');
    name.addEventListener('change', () => {
      object.name = name.value.trim() || object.className;
      name.value = object.name;
      this.refreshState();
    });
    header.append(name);
    this.button(header, 'deleteButton', 'Delete layer', () => this.delete());
    this.layerDiv.append(header);

    const type = document.createElement('span');
    type.className = 'layerType';
    type.textContent = { Textgroup: 'Text preset', Rectangle: 'Rectangle', ImageCustom: 'Image' }[object.className];
    this.layerDiv.append(type);

    const actions = document.createElement('div');
    actions.className = 'layerActions';
    this.visButton = this.button(actions, 'visButton', 'Hide layer', () => this.toggleVisibility());
    this.lockButton = this.button(actions, 'lockButton', 'Lock layer', () => this.toggleLock());
    this.upButton = this.button(actions, 'upButton', 'Move layer forward', () => this.move(1));
    this.downButton = this.button(actions, 'downButton', 'Move layer backward', () => this.move(-1));
    this.layerDiv.append(actions);

    const animation = document.createElement('div');
    animation.className = 'layerAnimation';
    const select = document.createElement('select');
    select.className = 'animationSelect';
    select.setAttribute('aria-label', 'Layer animation');
    select.add(new Option('Choose animation', ''));
    Object.keys(animationController.animations).forEach(key => select.add(new Option(key === 'spin' ? 'Spin' : key, key)));
    animation.append(select);
    this.button(animation, 'runAnimationButton', 'Play animation in Preview', () => animationController.runAnimation(object, select.value));
    this.button(animation, 'stopAnimationButton', 'Reset layer animation', () => {
      animationController.stopAnimation(object);
      canvas.renderAll();
      updatePreview(true);
    });
    this.layerDiv.append(animation);

    const opacityLabel = document.createElement('label');
    opacityLabel.className = 'opacityControl';
    const opacity = document.createElement('input');
    opacity.type = 'range'; opacity.min = 0; opacity.max = 100; opacity.step = 1;
    opacity.className = 'opacityInput'; opacity.value = String(Math.round(object.opacity * 100));
    opacity.setAttribute('aria-label', 'Layer opacity');
    const opacityValue = document.createElement('output'); opacityValue.textContent = `${opacity.value}%`;
    opacityLabel.append('Opacity', opacity, opacityValue); this.layerDiv.append(opacityLabel);
    opacity.addEventListener('input', () => {
      animationController.stopAnimation(object);
      object.set({ opacity: Number(opacity.value) / 100 });
      opacityValue.textContent = `${opacity.value}%`; canvas.requestRenderAll();
    });

    if (object.className === 'Textgroup') {
      const preset = document.createElement('select');
      preset.className = 'styleSelect';
      styleNames.forEach((text, index) => preset.add(new Option(text, String(index))));
      preset.value = String(object.styleIndex);
      const content = document.createElement('textarea');
      content.className = 'text-content';
      content.value = object._objects[0].text;
      content.maxLength = SceneData.LIMITS.text;
      content.placeholder = 'Caption / テロップ';
      preset.addEventListener('change', () => {
        animationController.stopAnimation(object);
        object.rebuild(content.value, Number(preset.value));
        canvas.requestRenderAll();
      });
      content.addEventListener('input', () => {
        animationController.stopAnimation(object);
        object.rebuild(content.value);
        canvas.requestRenderAll();
      });
      const font = document.createElement('select');
      font.className = 'fontSelect';
      font.title = 'Uses fonts installed on your device, with Japanese and English fallbacks.';
      fontOptions.forEach(([label, family]) => font.add(new Option(label, family)));
      const currentFont = object._objects.at(-1).fontFamily;
      if (!fontOptions.some(([, family]) => family === currentFont)) font.add(new Option('Imported font', currentFont));
      font.value = currentFont;
      font.addEventListener('change', () => {
        animationController.stopAnimation(object);
        object.setFontFamily(font.value);
        canvas.requestRenderAll();
      });
      this.field('Text preset', preset);
      this.field('Font family', font);
      const typography = document.createElement('div'); typography.className = 'typographyControls';
      const sizeLabel = document.createElement('label'); sizeLabel.className = 'fieldLabel';
      const size = document.createElement('input'); size.type = 'number'; size.min = 8; size.max = 200; size.step = 1;
      size.className = 'fontSizeInput'; size.value = String(object._objects.at(-1).fontSize);
      sizeLabel.append('Font size (px)', size);
      size.addEventListener('change', () => {
        const value = Number(size.value);
        if (!Number.isFinite(value) || value < 8 || value > 200) { size.value = String(object._objects.at(-1).fontSize); return; }
        animationController.stopAnimation(object); object.setTypography({ fontSize: value }); canvas.requestRenderAll();
      });
      const alignLabel = document.createElement('label'); alignLabel.className = 'fieldLabel';
      const align = document.createElement('select'); align.className = 'textAlignSelect';
      ['left', 'center', 'right'].forEach(value => align.add(new Option(value[0].toUpperCase() + value.slice(1), value)));
      if (!['left', 'center', 'right'].includes(object._objects.at(-1).textAlign)) align.add(new Option('Imported alignment', object._objects.at(-1).textAlign));
      align.value = object._objects.at(-1).textAlign;
      align.addEventListener('change', () => {
        animationController.stopAnimation(object); object.setTypography({ textAlign: align.value }); canvas.requestRenderAll();
      });
      alignLabel.append('Text alignment', align); typography.append(sizeLabel, alignLabel); this.layerDiv.append(typography);
      this.field('Caption / テロップ', content);
    }

    if (object.className === 'Rectangle') {
      const colorRow = document.createElement('div');
      colorRow.className = 'layerColor';
      const color = document.createElement('input');
      color.type = 'color';
      color.className = 'colorInput';
      color.setAttribute('aria-label', 'Rectangle color');
      const hex = document.createElement('input');
      hex.type = 'text';
      hex.className = 'colorInputHex';
      hex.maxLength = 7;
      hex.setAttribute('aria-label', 'Rectangle hex color');
      hex.value = object.fill;
      if (/^#[0-9a-f]{6}$/i.test(object.fill)) color.value = object.fill;
      color.addEventListener('input', () => {
        object.set({ fill: color.value }); hex.value = color.value; hex.setCustomValidity(''); canvas.requestRenderAll();
      });
      hex.addEventListener('input', () => {
        const valid = /^#[0-9a-f]{6}$/i.test(hex.value);
        hex.setCustomValidity(valid ? '' : 'Use a six-digit hex color, for example #16a085.');
        hex.setAttribute('aria-invalid', String(!valid));
        if (valid) { object.set({ fill: hex.value }); color.value = hex.value; canvas.requestRenderAll(); }
      });
      colorRow.append(color, hex);
      this.layerDiv.append(colorRow);
    }
  }

  refreshState() {
    this.layerDiv.setAttribute('aria-label', `${this.name} layer`);
    for (const [button, pressed, text] of [
      [this.visButton, !this.visible, this.visible ? 'Hide layer' : 'Show layer'],
      [this.lockButton, this.locked, this.locked ? 'Unlock layer' : 'Lock layer']
    ]) {
      button.setAttribute('aria-pressed', String(pressed));
      button.setAttribute('aria-label', `${text}: ${this.name}`);
      button.title = `${text}: ${this.name}`;
    }
  }

  toggleVisibility() {
    const object = this.fabricObject;
    object.set({ visible: !object.visible });
    if (!object.visible && canvas.getActiveObject() === object) canvas.discardActiveObject();
    this.refreshState();
    canvas.requestRenderAll();
  }

  toggleLock() {
    const locked = !this.locked;
    this.fabricObject.set({
      lockMovementX: locked, lockMovementY: locked, lockRotation: locked,
      lockScalingX: locked, lockScalingY: locked, hasControls: !locked, selectable: !locked
    });
    if (locked && canvas.getActiveObject() === this.fabricObject) canvas.discardActiveObject();
    this.refreshState();
    canvas.requestRenderAll();
  }

  move(direction) {
    const index = canvas.getObjects().indexOf(this.fabricObject);
    const next = index + direction;
    if (next < 0 || next >= canvas.getObjects().length) return;
    this.fabricObject.moveTo(next);
    syncLayerOrder();
    canvas.requestRenderAll();
  }

  delete() {
    animationController.stopAnimation(this.fabricObject, false);
    canvas.remove(this.fabricObject);
    this.fabricObject.dispose();
    layers = layers.filter(layer => layer !== this);
    syncLayerOrder();
    canvas.requestRenderAll();
    notify(`Deleted ${this.name}.`);
  }
}


async function duplicateSelected() {
  if (sceneLoading) return false;
  const selected = canvas.getActiveObjects();
  if (selected.length !== 1 || !selected[0].selectable) { notify('Select one unlocked layer to duplicate.', true); return false; }
  const original = selected[0], sceneAtStart = activeObjects;
  try {
    const entries = SceneData.validate({ objects: [original.toObject()] });
    const [copy] = await enlivenScene(entries);
    if (sceneLoading || activeObjects !== sceneAtStart || !canvas.getObjects().includes(original)) { copy.dispose(); return false; }
    copy.set({ name: nextName(`${original.name} copy`), left: original.left + 20, top: original.top + 20 });
    copy.setCoords();
    return registerObject(copy);
  } catch (error) { notify(`Could not duplicate: ${error.message}`, true); return false; }
}

function alignSelected(direction) {
  const selected = canvas.getActiveObjects();
  if (sceneLoading || selected.length !== 1 || !selected[0].selectable) { notify('Select one unlocked layer to align.', true); return; }
  const object = selected[0];
  animationController.stopAnimation(object);
  const bounds = object.getBoundingRect(true, true);
  let dx = 0, dy = 0;
  if (direction === 'centerX') dx = (screenWidth - bounds.width) / 2 - bounds.left;
  if (direction === 'centerY') dy = (screenHeight - bounds.height) / 2 - bounds.top;
  if (direction === 'left') dx = -bounds.left;
  if (direction === 'right') dx = screenWidth - bounds.width - bounds.left;
  object.set({ left: object.left + dx, top: object.top + dy }); object.setCoords(); canvas.requestRenderAll();
}

document.querySelector('.duplicate-button').addEventListener('click', duplicateSelected);
document.querySelector('.align-select').addEventListener('change', event => {
  if (event.target.value) alignSelected(event.target.value);
  event.target.value = '';
});
