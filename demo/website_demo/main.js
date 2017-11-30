/**
 * Created by QAQ on 2017/11/30.
 */

function generate_texture(color, app) {
    var graphics = new PIXI.Graphics();

    graphics.beginFill(color, 1);
    graphics.drawRect(0, 0, 50, 50);

    return graphics.generateTexture();
}
function onDragStart(event) {
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
    var v = event.data.getLocalPosition(this);
    var anchor = event.currentTarget.anchor;
    console.log(this.tag);
    console.log(event.currentTarget.tag)
    anchor.x += v.x / 50;
    anchor.y += v.y / 50;
    this.x += v.x;
    this.y += v.y;
}

function onDragEnd() {
    this.alpha = 1;
    this.dragging = false;
    this.data = null;
}

function onDragMove() {
    if (this.dragging) {
        var new_position = this.data.getLocalPosition(this.parent);
        this.x = new_position.x;
        this.y = new_position.y;
    }
}

function generate_item(app, x, y) {
    var texture = generate_texture(0xFFF122, app);
    var item = new PIXI.Sprite(texture);
    item.x = x;
    item.y = y;
    return item;
}

function seter(group) {

}

function generate_group(app) {
    var item0 = generate_item(app, 0, 0);
    var item1 = generate_item(app, 50, 50);
    //var group = new PIXI.Sprite();
    var group = generate_item(app, 25, 25);

    group.addChild(item0);
    group.addChild(item1);
    group.interactive = true;
    group.buttonMode = true;
    group.anchor.set(0.5);
    group.tag = "wqa";
    group.on('pointerdown', onDragStart)
         .on('pointerup', onDragEnd)
         .on('pointerupoutside', onDragEnd)
         .on('pointermove', onDragMove);
    group.x = 100;
    group.y = 100;

    return group;
}

var app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb});
document.body.appendChild(app.view);

app.stage.addChild(generate_group(app));
