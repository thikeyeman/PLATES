var fonts = ["小塚ゴシック Pro B", "小塚ゴシック Pro M", "小塚ゴシック Pro H"];

WebFont.load({
  google: {
    families: ['kozuka-gothic-pro', 'Noto Sans JP', 'M PLUS 1p', 'Noto Serif JP']
  }
});
class Textgroup extends fabric.Group {
  constructor(content, x, y, styleIndex, scaleX, scaleY, name) {
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

    canvas.add(this);
    activeObjects.push(this);
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


/*最前面の文字*/
var styles = [
  /*0*/
  {
    /*青文字テロップ*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  },
  /*1*/
  {
    /*赤文字テロップ*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    lineJoin: 'round',
    shadow: null,
  },
  /*2*/
  {
    /*紫文字テロップ*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  },
  /*3*/
  {
    /*黒文字テロップ*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  },
  /*4*/
  {
    /*茶文字テロップ*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  },
  /*5*/
  {
    /*青文字サイド*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#0000c8',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  },
  /*6*/
  {
    /*赤文字サイド*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#c80000',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  }, /*7*/
  {
    /*黒文字サイド*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#4d4d4d',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  }, {
    /*茶文字サイド*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#8c6239',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  }, {
    /*赤見出し*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#000000',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  }, {
    /*緑文字サイド*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#009600',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  }, {
    /*NGテロップ*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    shadow: null,
  }
];

/*真ん中の文字*/
var shadowStyles = [
  /*0*/
  {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#00009b',
    stroke: '#00009b',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, /*1*/ {
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#c1272d',
    stroke: '#c1272d',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
    lineJoin: 'round'

  }, /*2*/ {
    /*紫文字テロップ*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#880090',
    stroke: '#880090',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, /*3*/ {
    /*黒文字テロップ*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#000000',
    stroke: '#000000',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, /*4*/ {
    /*茶文字テロップ*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#603813',
    stroke: '#603813',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, /*5*/ {
    /*青サイド*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#ffffff',
    stroke: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, /*6*/ {
    /*赤サイド*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#ffffff',
    stroke: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, /*6*/ {
    /*黒サイド*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#ffffff',
    stroke: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, /*6*/ {
    /*茶サイド*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#ffffff',
    stroke: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, /*7*/ {
    /*赤見出し*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
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
    /*緑サイド*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#ffffff',
    stroke: '#ffffff',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }, {
    /*NGテロップ*/
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Noto Sans JP',
    fill: '#009100',
    stroke: '#009100',
    charSpacing: 180,
    textAlign: 'center',
    strokeWidth: 3,
    shadow: null,
  }
];

/*最背面の文字*/
var shadow2Styles = [ /*0*/ {
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: 'Noto Sans JP',
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
}, /*1*/ {
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: 'Noto Sans JP',
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
}, /*2*/ {
  /*紫文字テロップ*/
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: 'Noto Sans JP',
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
}, /*3*/ {
  /*黒文字テロップ*/
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: 'Noto Sans JP',
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

}, /*4*/ {
  /*茶文字テロップ*/
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: 'Noto Sans JP',
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
}, /*5*/ {
  /*青サイド*/
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: 'Noto Sans JP',
  fill: '#000076',
  stroke: '#000076',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: null,
}, /*6*/ {
  /*赤サイド*/
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: 'Noto Sans JP',
  fill: '#820000',
  stroke: '#820000',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: null,
}, /*6*/ {
  /*赤サイド*/
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: 'Noto Sans JP',
  fill: '#000000',
  stroke: '#000000',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: null,

}, {
  /*茶サイド*/
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: 'Noto Sans JP',
  fill: '#754c24',
  stroke: '#754c24',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: null,
}, {
  /*赤見出し*/
  fontSize: 0,
  fontWeight: 'bold',
  fontFamily: 'Noto Sans JP',
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
  /*緑サイド*/
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: 'Noto Sans JP',
  fill: '#754c24',
  stroke: '#754c24',
  charSpacing: 180,
  textAlign: 'center',
  strokeWidth: 6,
  shadow: null,
}, {
  /*NGテロップ*/
  fontSize: 25,
  fontWeight: 'bold',
  fontFamily: 'Noto Sans JP',
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
