/**
 * Created by QAQ on 2017/11/30.
 */

/**
 *
 *  A  Piece
 *  可以被拖动的棋子, 在移动的各个过程调用响应的回调函数
 * @param pieceId 棋子 Id
 * @param cellList 棋子所占的格子
 * @param PieceColor 棋子的颜色
 * @param DragStartCallBack
 * @param DragMoveCallBack
 * @param DragEndCallBack
 * @returns 返回一个棋子
 * @constructor
 */
function PieceFactory(pieceId,
                      shape,
                      PieceColor,
                      DragStartCallBack,
                      DragMoveCallBack,
                      DragEndCallBack) {
    function onDragStart(event) {
        this.data = event.data;
        this.anchorPoint = this.data.getLocalPosition(this);
        this.alpha = 1;
        this.dragging = true;
        //TODO this function is not work yet
        DragStartCallBack(pieceId, this.State());
    }

    function onDragMove() {
        if (this.dragging) {
            var new_position = this.data.getLocalPosition(this.parent);
            this.x = new_position.x - this.anchorPoint.x;
            this.y = new_position.y - this.anchorPoint.y;
            DragMoveCallBack(pieceId, this.State());
        }
    }

    function onDragEnd() {
        this.alpha = 0.8;
        this.dragging = false;
        this.data = null;
        if (true)
            DragEndCallBack(
                pieceId, 
                this.State()
            );
    }

    function CellList_2_Polygon(cell_list, offset){
        var vertex_list = [new PIXI.Point(0, 0)];
        cell_list.forEach(function (cell) {
            [[0, 0], [0, 1], [1, 1], [1, 0], [0 ,0]].forEach(function (point) {
                vertex_list.push(
                    new PIXI.Point(
                        (cell[0] + point[0]) * gCellSize + offset.x,
                        (cell[1] + point[1]) * gCellSize + offset.y
                    )
                )
            })
            vertex_list.push(new PIXI.Point(0, 0));
        });

        return new PIXI.Polygon(vertex_list);
    }

    var pieces = new PIXI.Container();
    pieces.piece = []

    shape.forEach(function(cellList, state){
        var polygon = CellList_2_Polygon(cellList, new PIXI.Point());

        var graphics = new PIXI.Graphics();
        graphics.beginFill(PieceColor, 1);
        graphics.drawPolygon(polygon);
        // todo adhoc
        graphics.lineStyle(1, 0xFFFFFF, 1);
        graphics.endFill();
        cellList.forEach(function (cells) {
            graphics.drawRect(
                cells.x * gCellSize,
                cells.y * gCellSize,
                gCellSize,
                gCellSize
            )
        });
        graphics.endFill();

        var piece = new PIXI.Sprite(graphics.generateTexture());
        //piece.hitArea = polygon;
        piece.shape = polygon;
        piece.cellList = cellList;
        piece.visible = false;

        pieces.piece.push(piece);
        pieces.addChild(piece);
    })

    pieces.alpha = 0.8;
    pieces.anchor = new PIXI.Point();
    pieces.interactive = true
    pieces
        .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);

    pieces.SetState = function (state) {
        if (typeof(this.state) !== "undefined")
            this.piece[this.state].visible = false;
        this.state = state;
        this.piece[state].visible = true;
    };
    pieces.SetState(0);

    pieces.State = function() {
        return {
            state: this.state, 
            x: Math.floor(this.x / gCellSize + 0.5),
            y: Math.floor(this.y / gCellSize + 0.5),
        };
    }

    pieces.SetVisible = function(visible) {
        pieces.visible = visible
    }

    pieces.SetInteractive = function(interactive){
        pieces.interactive = interactive
    }

    pieces.Flip = function(){
        var new_state = this.state ^ 1
        this.SetState(new_state);
    };
    pieces.Rotate = function(clock){
        var new_state = (this.state + ((this.state % 2) ^ clock ? 2 : 6)) % 8
        this.SetState(new_state);
    };

    return pieces;
}

