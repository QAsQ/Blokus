/**
 * Created by QAQ on 2017/11/30.
 */
gCellWidth = 100;
gCellHeight = 100;

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
        //event.currentTarget.update_interaction(
        //    event.data.getLocalPosition(this));
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
    cell_list.reverse().forEach(function (point) {
        vertex_list.push(
            new PIXI.Point(
                point.x * gCellWidth,
                point.y * gCellHeight
            )
        )
    });
    var graphics = new PIXI.Graphics();
    graphics.beginFill(chess_color, 1);

    var polygon = new PIXI.Polygon(vertex_list);
    graphics.drawPolygon(polygon);

    var chess = new PIXI.Sprite(graphics.generateTexture());
    chess.interactive = true;
    chess.buttonMode = true;
    chess.hitArea = polygon;
    chess.on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);

    chess.shape = polygon;
    chess.cell_list = cell_list;
    chess.update_interaction = function (v) {
        this.anchor.x += v.x / 200;
        this.anchor.y += v.y / 200;

        this.x += v.x;
        this.y += v.y;
    };

    return chess;
}

var app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb});
document.body.appendChild(app.view);

cell_list = [
    new PIXI.Point(0, 0),
    new PIXI.Point(1, 1)
];
var chess1 = ChessFactory(app, cell_list, 0xFFBB00);
app.stage.addChild(chess1);

cell_list2 = [
    new PIXI.Point(0, 0),
    new PIXI.Point(1, 1),
    new PIXI.Point(0, 1)
];

var chess2 = ChessFactory(app, cell_list2, 0xAAFF00);
chess2.x = 200
chess2.y = 200
app.stage.addChild(chess2);
