'use strict';

class AnimationController {
  constructor(renderCanvas = canvas, onFrame = updatePreview) {
    this.canvas = renderCanvas;
    this.onFrame = onFrame;
    this.animations = {
      FadeIn: state => ({ from: { opacity: 0 }, to: { opacity: state.opacity ?? 1 }, duration: 1 }),
      FadeOut: () => ({ from: {}, to: { opacity: 0 }, duration: 1 }),
      FloatIn: state => ({ from: { opacity: 0, top: state.top + 80 }, to: { opacity: state.opacity ?? 1, top: state.top }, duration: 1 }),
      SlideIn: (state, object) => ({ from: { left: -object.getScaledWidth() }, to: { left: state.left }, duration: 1 }),
      ZoomOut: () => ({ from: {}, to: { scaleX: 0, scaleY: 0 }, duration: 1 }),
      spin: state => ({ from: {}, to: { angle: state.angle + 360 }, duration: 1.5 })
    };
    this.running = new Map();
    this.originalStates = new Map();
  }

  isRunning() { return this.running.size > 0; }

  runAnimation(object, name, playbackState = {}) {
    if (!Object.hasOwn(this.animations, name)) {
      notify('Choose an animation first.', true);
      return null;
    }
    if (!object.visible) {
      notify('Show this layer before running an animation.', true);
      return null;
    }
    this.stopAnimation(object);
    const state = {};
    for (const key of ['left', 'top', 'angle', 'scaleX', 'scaleY', 'opacity']) state[key] = playbackState.state?.[key] ?? object[key];
    object.set(state);
    this.originalStates.set(object, state);
    const animation = this.animations[name](state, object);
    const from = { ...state, ...animation.from };
    const started = playbackState.started ?? performance.now();
    let frame;
    const playback = { name, started, state: { ...state }, kill: () => cancelAnimationFrame(frame) };
    const render = progress => {
      const eased = name === 'spin'
        ? (progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2)
        : 1 - (1 - progress) ** 3;
      for (const key of Object.keys(animation.to)) {
        object[key] = from[key] + (animation.to[key] - from[key]) * eased;
      }
      object.dirty = true;
      this.canvas.renderAll();
    };
    const tick = now => {
      if (this.running.get(object) !== playback) return;
      const progress = Math.min(1, Math.max(0, (now - started) / (animation.duration * 1000)));
      render(progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else {
        this.running.delete(object);
        if (name === 'spin') object.set({ angle: state.angle });
        object.setCoords();
        this.canvas.renderAll();
        this.onFrame(true);
      }
    };
    this.running.set(object, playback);
    object.set(animation.from);
    tick(performance.now());
    return playback;
  }

  stopAnimation(object, reset = true) {
    this.running.get(object)?.kill();
    this.running.delete(object);
    const original = this.originalStates.get(object);
    if (reset && original) object.set(original);
    this.originalStates.delete(object);
    object.setCoords();
    this.canvas.requestRenderAll();
  }

  stopAll() {
    for (const object of this.originalStates.keys()) this.stopAnimation(object);
    this.canvas.renderAll();
    this.onFrame(true);
  }
}

const animationController = new AnimationController();
function stopAllAnimations() { animationController.stopAll(); }
