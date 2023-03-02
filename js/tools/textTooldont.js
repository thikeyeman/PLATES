class Text {
    constructor(content, x, y, style, name) {
        this.content = content;
        this.top = x;
        this.left = y;
        this.style = style;
		this.name = name;
        return this.create();
    }
    create() {
        var text = new fabric.Textbox(this.content, {
            top: this.top,
            left: this.left,
			name: this.name
        });
        Object.keys(this.style).forEach(key => {
            text.set(key, this.style[key]);
        });
        canvas.add(text);
        activeObjects.push(text);
		return text;
    }
    createController() {

    }
    update() {

    }

}
var styles = [{
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    fill: 'black',
}, {
    fontSize: 30,
    fontFamily: 'Arial',
    fill: 'red'
}, {
    fontSize: 30,
    fontFamily: 'Arial',
    fill: 'red'
}];
