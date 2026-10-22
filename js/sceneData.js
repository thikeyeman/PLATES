(function (root) {
  'use strict';

  const LIMITS = Object.freeze({ bytes: 10 * 1024 * 1024, objects: 200, text: 20000, imagePixels: 16000000 });
  const TYPES = { Textgroup: 'group', Rectangle: 'rect', ImageCustom: 'image' };
  const NUMBERS = ['left', 'top', 'width', 'height', 'scaleX', 'scaleY', 'angle', 'skewX', 'skewY',
    'opacity', 'strokeWidth', 'strokeDashOffset', 'strokeMiterLimit', 'rx', 'ry', 'cropX', 'cropY',
    'fontSize', 'charSpacing', 'lineHeight', 'minWidth'];
  const BOOLEANS = ['flipX', 'flipY', 'visible', 'strokeUniform', 'underline', 'overline',
    'linethrough', 'splitByGrapheme'];
  const STRINGS = ['originX', 'originY', 'fill', 'stroke', 'strokeLineCap', 'strokeLineJoin',
    'fillRule', 'paintFirst', 'globalCompositeOperation', 'backgroundColor', 'fontFamily',
    'fontStyle', 'textAlign', 'direction', 'textBackgroundColor'];

  function fail(message) { throw new Error(message); }
  function record(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${label} must be an object.`);
  }
  function string(value, label, max = LIMITS.text) {
    if (typeof value !== 'string' || value.length > max) fail(`${label} must be text of at most ${max} characters.`);
    return value;
  }
  function number(value, label, min = -100000, max = 100000) {
    if (!Number.isFinite(value) || value < min || value > max) fail(`${label} is outside the supported range.`);
    return value;
  }
  function boolean(value, label) {
    if (typeof value !== 'boolean') fail(`${label} must be true or false.`);
    return value;
  }
  function imageSource(src) {
    if (typeof src !== 'string' || !/^data:image\/(png|jpeg|gif|webp|bmp);base64,[a-z0-9+/=\s]+$/i.test(src)) {
      fail('Images must be embedded PNG, JPEG, GIF, WebP, or BMP data. External URLs and SVG images are not supported.');
    }
    return src;
  }
  function properties(raw) {
    const result = {};
    for (const key of NUMBERS) {
      if (raw[key] === undefined) continue;
      const nonnegative = ['width', 'height', 'scaleX', 'scaleY', 'strokeWidth', 'fontSize', 'minWidth', 'cropX', 'cropY', 'rx', 'ry'].includes(key);
      result[key] = number(raw[key], key, nonnegative ? 0 : -100000, key === 'opacity' ? 1 : 100000);
      if (key === 'opacity' && result[key] < 0) fail('Opacity must be between 0 and 1.');
      if (['scaleX', 'scaleY'].includes(key) && result[key] > 100) fail('Object scale must not exceed 100.');
      if (['width', 'height'].includes(key) && result[key] > 16000) fail('Object dimensions must not exceed 16000 pixels.');
      if (key === 'fontSize' && result[key] > 500) fail('Font size must not exceed 500 pixels.');
      if (key === 'lineHeight' && (result[key] <= 0 || result[key] > 10)) fail('Line height must be between 0 and 10.');
    }
    for (const key of BOOLEANS) {
      if (raw[key] !== undefined) result[key] = boolean(raw[key], key);
    }
    for (const key of STRINGS) {
      if (raw[key] === undefined) continue;
      result[key] = raw[key] === null && ['fill', 'stroke'].includes(key) ? null : string(raw[key], key, 300);
    }
    for (const [key, allowed] of Object.entries({ originX: ['left', 'center', 'right'], originY: ['top', 'center', 'bottom'] })) {
      if (result[key] !== undefined && !allowed.includes(result[key])) fail(`Unsupported ${key}.`);
    }
    if (raw.fontWeight !== undefined) {
      result.fontWeight = typeof raw.fontWeight === 'number' ? number(raw.fontWeight, 'Font weight', 1, 1000) : string(raw.fontWeight, 'Font weight', 30);
    }
    if (raw.shadow) {
      record(raw.shadow, 'Shadow');
      result.shadow = { color: string(raw.shadow.color, 'Shadow color', 100) };
      for (const key of ['blur', 'offsetX', 'offsetY']) {
        if (raw.shadow[key] !== undefined) result.shadow[key] = number(raw.shadow[key], `Shadow ${key}`, key === 'blur' ? 0 : -1000, 1000);
      }
      for (const key of ['affectStroke', 'nonScaling']) {
        if (raw.shadow[key] !== undefined) result.shadow[key] = boolean(raw.shadow[key], `Shadow ${key}`);
      }
    } else if (raw.shadow === null) result.shadow = null;
    if (raw.strokeDashArray != null) {
      if (!Array.isArray(raw.strokeDashArray) || raw.strokeDashArray.length > 20) fail('Invalid stroke dash array.');
      result.strokeDashArray = raw.strokeDashArray.map(value => number(value, 'Stroke dash', 0, 1000));
    }
    if (raw.clipPath || raw.fill && typeof raw.fill === 'object' || raw.stroke && typeof raw.stroke === 'object' || raw.filters?.length) {
      fail('Clipping, image filters, gradients, and pattern fills are not supported in PLATES projects.');
    }
    return result;
  }
  function object(raw, index) {
    record(raw, `Object ${index + 1}`);
    if (!Object.hasOwn(TYPES, raw.className)) fail(`Object ${index + 1} has an unsupported class.`);
    const type = TYPES[raw.className];
    if (raw.type !== undefined && raw.type !== type) fail(`Object ${index + 1} has an incompatible type.`);
    const result = { ...properties(raw), type, className: raw.className, name: string(raw.name ?? raw.className, 'Object name', 200) };
    if (type === 'image') {
      result.src = imageSource(raw.src);
      if ((result.width || 0) * (result.height || 0) > LIMITS.imagePixels) fail('Image dimensions exceed 16 megapixels.');
    }
    if (type === 'group') {
      result.styleIndex = raw.styleIndex ?? 0;
      if (!Number.isInteger(result.styleIndex) || result.styleIndex < 0 || result.styleIndex >= 12) fail('Unknown text preset.');
      result.content = string(raw.content ?? raw.objects?.[0]?.text ?? '', 'Text content');
      if (raw.objects !== undefined) {
        if (!Array.isArray(raw.objects) || raw.objects.length !== 3) fail('A text group must contain its three text layers.');
        result.objects = raw.objects.map(child => {
          record(child, 'Text layer');
          if (child.type !== 'textbox') fail('Only textboxes are supported inside a text group.');
          const text = string(child.text, 'Text layer content');
          if (text !== result.content) fail('Text layers in a PLATES preset must contain identical text.');
          if (child.styles && Object.keys(child.styles).length) fail('Per-character text formatting is not supported.');
          return { ...properties(child), type: 'textbox', text, styles: {} };
        });
      }
    }
    return result;
  }
  function validate(data) {
    record(data, 'Project');
    if (data.version !== undefined && data.version !== 1) fail('This project uses an unsupported file version.');
    if (data.version === 1 && (data.width !== 960 || data.height !== 540)) fail('PLATES projects use a 960 × 540 canvas.');
    if (!Array.isArray(data.objects) || data.objects.length > LIMITS.objects) fail(`A project must contain an objects array with at most ${LIMITS.objects} objects.`);
    const objects = data.objects.map(object);
    const order = data.savedStackOrders ?? objects.map((_, index) => index);
    if (!Array.isArray(order) || order.length !== objects.length || new Set(order).size !== objects.length ||
      order.some(value => !Number.isInteger(value) || value < 0 || value >= objects.length)) fail('The saved layer order is invalid.');
    if (data.layers !== undefined && (!Array.isArray(data.layers) || data.layers.length !== objects.length)) fail('Layer metadata does not match the objects.');
    const metadata = data.layers ?? [];
    metadata.forEach(layer => {
      record(layer, 'Layer');
      if (layer.visible !== undefined) boolean(layer.visible, 'Layer visibility');
      if (layer.locked !== undefined) boolean(layer.locked, 'Layer lock');
      if (layer.name !== undefined) string(layer.name, 'Layer name', 200);
    });
    return objects.map((item, index) => {
      const matches = metadata.filter(layer => layer.name === item.name);
      const layer = data.version === 1 ? metadata[index] : matches.length === 1 ? matches[0] :
        metadata.find(layer => layer.index === index && layer.name === item.name) ?? metadata[index];
      const visible = layer?.visible ?? item.visible ?? true;
      if (data.version === undefined && !visible && item.opacity === 0) item.opacity = 1;
      item.visible = visible;
      return { object: item, locked: layer?.locked ?? false, order: order[index] };
    }).sort((a, b) => a.order - b.order);
  }
  function parse(text) {
    if (typeof text !== 'string' || new TextEncoder().encode(text).length > LIMITS.bytes) fail('Project files must be at most 10 MiB.');
    let data;
    try { data = JSON.parse(text); } catch { fail('The project is not valid JSON. Your current scene has been kept.'); }
    return validate(data);
  }

  const api = Object.freeze({ LIMITS, parse, validate, imageSource });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SceneData = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
