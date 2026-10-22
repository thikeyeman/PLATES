class Textgroup extends fabric.Group {
  constructor(content, x, y, styleIndex, scaleX, scaleY, name, typography = {}) {
    var back2Text = new fabric.Textbox(content, {
      top: y,
      left: x,
      width: 480,
      splitByGrapheme: true,
      originX: 'center',
      originY: 'center'
    });
    var backText = new fabric.Textbox(content, {
      top: y,
      left: x,
      width: 480,
      splitByGrapheme: true,
      originX: 'center',
      originY: 'center'
    });
    var text = new fabric.Textbox(content, {
      top: y,
      left: x,
      width: 480,
      splitByGrapheme: true,
      originX: 'center',
      originY: 'center'
    });

    Object.keys(styles[styleIndex]).forEach(key => {
      text.set(key, styles[styleIndex][key]);
    });
    Object.keys(shadowStyles[styleIndex]).forEach(key => {
      backText.set(key, shadowStyles[styleIndex][key]);
    });
    Object.keys(shadow2Styles[styleIndex]).forEach(key => {
      back2Text.set(key, shadow2Styles[styleIndex][key]);
    });

    [back2Text, backText, text].forEach(child => {
      if (typography.fontFamily) child.set('fontFamily', typography.fontFamily);
      if (typography.fontSize !== undefined) child.set('fontSize', child.fontSize * typography.fontSize / styles[styleIndex].fontSize);
      if (typography.textAlign) child.set('textAlign', typography.textAlign);
    });

    super([back2Text, backText, text], {
      content: content,
      styleIndex: styleIndex,
      scaleX: scaleX,
      scaleY: scaleY,
      name: name,
      className: 'Textgroup',
      lockUniScaling: true,
      originX: 'center',
      originY: 'center'
    });
    this.setControlsVisibility({
      ml: false,
      mr: false,
      mt: false,
      mb: false
    });

  }


  rebuild(content, styleIndex = this.styleIndex) {
    const replacement = new Textgroup(content, 0, 0, styleIndex, 1, 1, this.name, { fontFamily: this._objects.at(-1).fontFamily, fontSize: this._objects.at(-1).fontSize, textAlign: this._objects.at(-1).textAlign });
    this._objects.forEach(child => child.dispose());
    this._objects = replacement._objects;
    this._objects.forEach(child => { child.group = this; child.canvas = this.canvas; });
    this.set({ width: replacement.width, height: replacement.height, styleIndex, content, dirty: true });
    this.setCoords();
  }


  setFontFamily(fontFamily) { this.setTypography({ fontFamily }); }

  setTypography(properties) {
    const children = this._objects.map(child => new fabric.Textbox(child.text, {
      ...child.toObject(), ...properties,
      fontSize: properties.fontSize === undefined ? child.fontSize : child.fontSize * properties.fontSize / this._objects.at(-1).fontSize
    }));
    const replacement = new fabric.Group(children, { originX: 'center', originY: 'center' });
    this._objects.forEach(child => child.dispose());
    this._objects = replacement._objects;
    this._objects.forEach(child => { child.group = this; child.canvas = this.canvas; });
    this.set({ width: replacement.width, height: replacement.height, dirty: true });
    this.setCoords();
  }


  toObject() {
    return fabric.util.object.extend(super.toObject(), {
      content: this._objects[0].text,
      styleIndex: this.styleIndex,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      name: this.name,
      className: this.className,
      originX: this.originX,
      originY: this.originY
    });
  }
}


var styles = [
  {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  },
  {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    lineJoin: 'round',
    shadow: null,
  },
  {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  },
  {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  },
  {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  },
  {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#0000c8',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  },
  {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#c80000',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  },
  {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#4d4d4d',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#8c6239',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#000000',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#009600',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  }
];

var shadowStyles = [
  {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#00009b',
    stroke: '#00009b',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#c1272d',
    stroke: '#c1272d',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
    lineJoin: 'round'

  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#880090',
    stroke: '#880090',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#000000',
    stroke: '#000000',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#603813',
    stroke: '#603813',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#ffffff',
    stroke: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#ffffff',
    stroke: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#ffffff',
    stroke: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#ffffff',
    stroke: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#000000',
    stroke: '#000000',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 1,
    shadow: new fabric.Shadow({
      color: "#ff2e2e",
      blur: 1,
      offsetX: 2.5,
      offsetY: 2.5,
    }),
  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#ffffff',
    stroke: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
    fill: '#009100',
    stroke: '#009100',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }
];

var shadow2Styles = [ {
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
  fill: '#006eff',
  stroke: '#006eff',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: new fabric.Shadow({
    color: "#000000",
    blur: 1,
    offsetX: 2.5,
    offsetY: 2.5,
  }),
}, {
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
  fill: '#f15a24',
  stroke: '#f15a24',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  lineJoin: 'round',
  shadow: new fabric.Shadow({
    color: "#000000",
    blur: 1,
    offsetX: 2.5,
    offsetY: 2.5,
  }),
}, {
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
  fill: '#cc08d1',
  stroke: '#cc08d1',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: new fabric.Shadow({
    color: "#000000",
    blur: 1,
    offsetX: 2.5,
    offsetY: 2.5,
  }),
}, {
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
  fill: '#cccccc',
  stroke: '#cccccc',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: new fabric.Shadow({
    color: "#000000",
    blur: 1,
    offsetX: 2.5,
    offsetY: 2.5,
  }),

}, {
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
  fill: '#c69c6d',
  stroke: '#c69c6d',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: new fabric.Shadow({
    color: "#000000",
    blur: 1,
    offsetX: 2.5,
    offsetY: 2.5,
  }),
}, {
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
  fill: '#000076',
  stroke: '#000076',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: null,
}, {
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
  fill: '#820000',
  stroke: '#820000',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: null,
}, {
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
  fill: '#000000',
  stroke: '#000000',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: null,

}, {
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
  fill: '#754c24',
  stroke: '#754c24',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: null,
}, {
  fontSize: 0,
  fontWeight: 'bold',
  fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
  fill: '#000000',
  stroke: '#000000',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: new fabric.Shadow({
    color: "#ff2e2e",
    blur: 1,
    offsetX: 2.5,
    offsetY: 2.5,
  }),
}, {
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
  fill: '#754c24',
  stroke: '#754c24',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: null,
}, {
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
  fill: '#00b900',
  stroke: '#00b900',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: new fabric.Shadow({
    color: "#000000",
    blur: 8,
    offsetX: 4,
    offsetY: 4,
  }),
}];
