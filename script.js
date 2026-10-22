'use strict';

const screenWidth = 960;
const screenHeight = 540;
var canvas = new fabric.Canvas(document.querySelector('canvas'), {
  width: screenWidth, height: screenHeight, backgroundColor: '', preserveObjectStacking: true
});
let activeObjects = [];
let layers = [];
let newWindow = null;
let outputContext = null;
const realTimeMode = document.querySelector('.realTime-mode');
const previewButton = document.querySelector('.dispSub-button');
const outputBackground = document.querySelector('.output-background');
const programIndicator = document.querySelector('.program-status');
const programFrame = document.createElement('canvas');
programFrame.width = screenWidth; programFrame.height = screenHeight;
const programContext = programFrame.getContext('2d');
let programScene = null;
let programHasGraphics = false;
let programRevision = 0;
let programRenderer = null;
let programAnimations = null;

function showProgramState() {
  const realtime = realTimeMode.checked;
  programIndicator.textContent = realtime ? 'Program: REALTIME LIVE — edits broadcast' : programHasGraphics ? 'Program: Live snapshot' : 'Program: Cleared';
  programIndicator.classList.toggle('is-realtime', realtime);
}

function resetPreview() {
  newWindow = null; outputContext = null;
  previewButton.textContent = 'Open output';
}

function updatePreview() {
  if (!newWindow || newWindow.closed) { if (newWindow) resetPreview(); return; }
  try {
    if (outputContext.canvas.ownerDocument !== newWindow.document || !outputContext.canvas.isConnected) throw new Error('Output document changed.');
    outputContext.clearRect(0, 0, screenWidth, screenHeight);
    const chroma = outputBackground.value === 'chroma';
    if (chroma) { outputContext.fillStyle = '#00ff00'; outputContext.fillRect(0, 0, screenWidth, screenHeight); }
    newWindow.document.documentElement.style.backgroundColor = chroma ? '#00ff00' : 'transparent';
    newWindow.document.body.style.backgroundColor = chroma ? '#00ff00' : 'transparent';
    outputContext.drawImage(programFrame, 0, 0);
  } catch {
    resetPreview();
    notify('Output is no longer accessible. Open the output window again.', true);
  }
}

function copyProgramFrame(source) {
  programContext.clearRect(0, 0, screenWidth, screenHeight);
  programContext.drawImage(source, 0, 0, screenWidth, screenHeight);
  updatePreview();
}

function releaseProgramRenderer() {
  const renderer = programRenderer, animations = programAnimations;
  programRenderer = null; programAnimations = null;
  animations?.stopAll();
  renderer?.dispose();
}

function syncRealtime() {
  if (!realTimeMode.checked || sceneLoading) return false;
  try {
    const snapshot = serializeScene();
    releaseProgramRenderer();
    programScene = snapshot;
    programHasGraphics = canvas.getObjects().length > 0;
    copyProgramFrame(canvas.lowerCanvasEl);
    showProgramState();
    return true;
  } catch (error) {
    notify(`Preview cannot go live: ${error.message} Program has been kept.`, true);
    return false;
  }
}

async function takeLive() {
  if (sceneLoading) { notify('Wait for Preview to finish loading before taking it live.', true); return false; }
  const revision = ++programRevision;
  let renderer, candidateAnimations;
  try {
    const snapshot = serializeScene();
    canvas.renderAll();
    if (realTimeMode.checked) return syncRealtime();
    const plans = canvas.getObjects().map((object, index) => {
      const playing = animationController.running.get(object);
      return playing && { index, name: playing.name, started: playing.started, state: { ...playing.state } };
    }).filter(Boolean);
    const entries = SceneData.parse(snapshot);
    const objects = await enlivenScene(entries);
    await document.fonts?.ready;
    renderer = new fabric.StaticCanvas(document.createElement('canvas'), {
      width: screenWidth, height: screenHeight, enableRetinaScaling: false, renderOnAddRemove: false
    });
    renderer.add(...objects);
    renderer.renderAll();
    renderer.on('after:render', () => { if (programRenderer === renderer) copyProgramFrame(renderer.lowerCanvasEl); });
    candidateAnimations = new AnimationController(renderer, () => {
      if (programRenderer === renderer) copyProgramFrame(renderer.lowerCanvasEl);
    });
    plans.forEach(plan => candidateAnimations.runAnimation(objects[plan.index], plan.name, plan));
    renderer.renderAll();
    if (revision !== programRevision) { candidateAnimations.stopAll(); renderer.dispose(); return false; }
    releaseProgramRenderer();
    programRenderer = renderer;
    programAnimations = candidateAnimations;
    programScene = snapshot;
    programHasGraphics = objects.length > 0;
    copyProgramFrame(renderer.lowerCanvasEl);
    showProgramState();
    notify('Preview taken live. Further edits stay private until the next Take Live.');
    return true;
  } catch (error) {
    if (renderer && renderer !== programRenderer) { candidateAnimations?.stopAll(); renderer.dispose(); }
    if (revision === programRevision) notify(`Could not take Preview live: ${error.message} Program has been kept.`, true);
    return false;
  }
}

function clearLive() {
  ++programRevision;
  realTimeMode.checked = false;
  releaseProgramRenderer();
  programScene = null; programHasGraphics = false;
  programContext.clearRect(0, 0, screenWidth, screenHeight);
  showProgramState(); updatePreview();
  notify('Program cleared; Preview is unchanged. Realtime output is off.');
}

function openSubCanvas() {
  if (newWindow && !newWindow.closed) { updatePreview(); newWindow.focus(); return newWindow; }
  const opened = window.open('', '_blank', `popup,width=${screenWidth},height=${screenHeight}`);
  if (!opened) { resetPreview(); notify('The output popup was blocked. Allow popups for this site and try again.', true); return null; }
  try {
    newWindow = opened;
    const outputDocument = opened.document;
    outputDocument.documentElement.lang = 'en';
    outputDocument.head.replaceChildren();
    const style = outputDocument.createElement('style');
    style.textContent = 'html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent;cursor:none}canvas{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}';
    outputDocument.head.append(style); outputDocument.title = 'PLATES Output';
    const output = outputDocument.createElement('canvas'); output.width = screenWidth; output.height = screenHeight;
    output.setAttribute('aria-label', 'PLATES live graphics output');
    outputDocument.body.replaceChildren(output); outputContext = output.getContext('2d');
    opened.addEventListener('beforeunload', () => { if (newWindow === opened) resetPreview(); }, { once: true });
    previewButton.textContent = 'Focus output'; updatePreview();
    notify('Output opened. Take Live publishes Preview; opening this window does not broadcast a draft.');
    return opened;
  } catch { resetPreview(); notify('Could not initialize the output window. Close it and try again.', true); return null; }
}

canvas.on('after:render', syncRealtime);
realTimeMode.addEventListener('change', () => {
  ++programRevision;
  releaseProgramRenderer();
  if (realTimeMode.checked) {
    canvas.renderAll(); syncRealtime();
    notify('REALTIME LIVE: Preview edits are now broadcast automatically.');
  } else notify('Realtime output off. Program is frozen; use Take Live to publish changes.');
  showProgramState(); updatePreview();
});
previewButton.addEventListener('click', openSubCanvas);
outputBackground.addEventListener('change', updatePreview);
document.querySelector('.take-live-button').addEventListener('click', takeLive);
document.querySelector('.clear-live-button').addEventListener('click', clearLive);

function hide() {
  const container = document.querySelector('.activeObjectsContainer');
  container.hidden = !container.hidden;
  const button = document.querySelector('.minimize-btn');
  button.textContent = container.hidden ? 'Show layers' : 'Hide layers';
  button.setAttribute('aria-expanded', String(!container.hidden));
}
document.querySelector('.minimize-btn').addEventListener('click', hide);
function fitEditorCanvas() {
  const viewport = document.querySelector('.canvasViewport');
  const scale = Math.max(0.05, Math.min(1, (viewport.clientWidth - 32) / screenWidth,
    (viewport.clientHeight - 32) / screenHeight)) * Number(document.querySelector('.canvasScale-input').value);
  const frame = document.querySelector('.canvasFrame');
  frame.style.width = `${screenWidth * scale}px`;
  frame.style.height = `${screenHeight * scale}px`;
  document.querySelector('.canvasContainer').style.transform = `scale(${scale})`;
  canvas.calcOffset();
}
document.querySelector('.canvasScale-input').addEventListener('input', event => {
  document.querySelector('#canvas-scale-value').value = Number(event.target.value) === 1 ? 'Fit' : `${Math.round(event.target.value * 100)}%`;
  fitEditorCanvas();
});
new ResizeObserver(fitEditorCanvas).observe(document.querySelector('.canvasViewport'));
document.querySelector('.resetAnimations-button').addEventListener('click', () => stopAllAnimations());


canvas.on('object:moving', ({ target }) => {
  if (Math.abs(target.left - screenWidth / 2) < 12) target.set({ left: screenWidth / 2 });
});
canvas.on('object:modified', ({ target }) => animationController.stopAnimation(target, false));
window.addEventListener('beforeunload', () => {
  if (newWindow && !newWindow.closed) newWindow.close();
});

const videoPreview = document.querySelector('.demoVideo');
const videoToggle = document.querySelector('.video-preview');
async function setVideoPreview() {
  videoPreview.hidden = !videoToggle.checked;
  if (!videoToggle.checked) { videoPreview.pause(); return; }
  if (!videoPreview.getAttribute('src')) videoPreview.src = 'assets/city-preview.webm';
  videoPreview.muted = true;
  try { await videoPreview.play(); }
  catch (error) {
    if (error.name === 'AbortError' || !videoToggle.checked) return;
    videoToggle.checked = false;
    videoPreview.hidden = true;
    notify('Video preview could not play. Enable Video background to retry; graphics output still works.', true);
  }
}
videoToggle.addEventListener('change', setVideoPreview);
window.addEventListener('DOMContentLoaded', setVideoPreview, { once: true });

canvas.upperCanvasEl.tabIndex = 0;
canvas.upperCanvasEl.setAttribute('aria-label', 'Graphics editing canvas. Press Delete to remove selected layers.');
canvas.on('mouse:down', () => canvas.upperCanvasEl.focus({ preventScroll: true }));
canvas.upperCanvasEl.addEventListener('keydown', event => {
  if (event.isComposing || canvas.getActiveObject()?.isEditing || sceneLoading) return;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
    event.preventDefault(); duplicateSelected(); return;
  }
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'Escape') { canvas.discardActiveObject(); canvas.requestRenderAll(); return; }
  if (!['Delete', 'Backspace'].includes(event.key)) return;
  const selected = canvas.getActiveObjects().filter(object => object.selectable && !object.lockMovementX);
  if (!selected.length) return;
  event.preventDefault(); canvas.discardActiveObject();
  selected.forEach(object => layers.find(layer => layer.fabricObject === object)?.delete());
});
