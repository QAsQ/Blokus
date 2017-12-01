/**
 * Created by QAQ on 2017/11/30.
 */
gCellWidth = 50;
gCellHeight = 50;

/**
 *  这是什么：一个棋子
 *  具体：一个 sprite 对象 + 一些方法
 *  Factory：(app, color, cell_list)
 *  怎么用：
 *  什么方法
 *      翻转，旋转
 *      获得顶点的 Point
 *
 *      更新 anchor & hitArea(by offset)
 *
 */
function ChessFactory(app, cell_list, chess_color) {
    function onDragStart(event) {
        this.data = event.data;
        this.alpha = 0.5;
        this.dragging = true;
        var v = event.data.getLocalPosition(this);
        var anchor = event.currentTarget.anchor;
        anchor.x += v.x / 100;
        anchor.y += v.y / 100;
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
    var vertex_list = [];
    cell_list.forEach(function (point) {
        [[0, 0], [0, 1], [1, 1], [1, 0], [0 ,0]].forEach(function (offset) {
            vertex_list.push(
                new PIXI.Point(
                    (point.x + offset[0]) * gCellWidth,
                    (point.y + offset[1]) * gCellHeight
                )
            )
        })
    });
    var graphics = new PIXI.Graphics();
    graphics.beginFill(chess_color, 1);

    var polygon = new PIXI.Polygon(vertex_list);
    graphics.drawPolygon(polygon);

    var chess = new PIXI.Sprite(graphics.generateTexture());
    chess.shape = polygon;
    chess.interactive = true;
    chess.buttonMode = true;
    chess.hitArea = chess.shape;
    chess.on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);

    return chess;
}

var app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb});
document.body.appendChild(app.view);

cell_list = [
    new PIXI.Point(0, 0),
    new PIXI.Point(1, 1)
]
var chess = ChessFactory(app, cell_list, 0xFFBB00);
app.stage.addChild(chess);

