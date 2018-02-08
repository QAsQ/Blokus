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
        this.alpha = 1;
        this.dragging = true;
        //TODO this function is not work yet
        event.currentTarget.UpdateInteraction(
            event.data.getLocalPosition(this));
        DragStartCallBack(pieceId, this.position);
    }

    function onDragMove() {
        if (this.dragging) {
            var new_position = this.data.getLocalPosition(this.parent);
            this.x = new_position.x;
            this.y = new_position.y;
            DragMoveCallBack(pieceId, this.position);
        }
    }

    function onDragEnd() {
        this.alpha = 0.8;
        this.dragging = false;
        this.data = null;
        /*
        this.x = Math.floor(this.x / gCellSize + 0.5) * gCellSize
        this.y = Math.floor(this.y / gCellSize + 0.5) * gCellSize
        */
        //TOOD
        if (true)
            DragEndCallBack(
                pieceId, 
                {
                    state: this.state, 
                    x: Math.floor(this.x / gCellSize + 0.5),
                    y: Math.floor(this.y / gCellSize + 0.5),
                }
            );
    }

    function CellList_2_Polygon(cell_list, offset){
        var vertex_list = [];
        cell_list.forEach(function (cell) {
            [[0, 0], [0, 1], [1, 1], [1, 0], [0 ,0]].forEach(function (point) {
                vertex_list.push(
                    new PIXI.Point(
                        (cell.x + point[0]) * gCellSize + offset.x,
                        (cell.y + point[1]) * gCellSize + offset.y
                    )
                )
            })
        });

        cell_list.reverse().forEach(function (cell) {
            vertex_list.push(
                new PIXI.Point(
                    cell.x * gCellSize + offset.x,
                    cell.y * gCellSize + offset.y
                )
            )
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
        piece.visible = false
        piece.state = state 

        piece.on('pointerdown', onDragStart)
            .on('pointerup', onDragEnd)
            .on('pointerupoutside', onDragEnd)
            .on('pointermove', onDragMove);

        pieces.piece.push(piece)
        pieces.addChild(piece)
    })

    pieces.alpha = 0.8;
    pieces.anchor = new PIXI.Point();

    pieces.SetState = function (state) {
        console.log("Set state " + state);
        old_visible = false;
        old_interactive = false;
        if(this.state) {
            old_visible = this.piece[this.state].visible;
            old_interactive = this.piece[this.state].interactive;

            this.piece[this.state].visible = false;
            this.piece[this.state].interactive = false;
        }
        this.state = state
        this.piece[state].visible = old_visible
        this.piece[state].interactive = old_interactive
    };
    pieces.SetState(0);

    pieces.SetVisible = function(visible) {
        this.piece[this.state].visible = visible
    }

    pieces.SetInteractive = function(interactive){
        this.piece[this.state].interactive = interactive
    }

    pieces.Flip = function(){
        console.log("this function :flip NOT IMPLEMENTED YET!");
    };
    pieces.Rotate = function(){
        console.log("this function :rotate NOT IMPLEMENTED YET!");
    };
    pieces.UpdateInteraction = function (v) {
        /**
         *  TODO
         *  Move adhoc 200
         *  add hit Area offset
         */
        //this.anchor.x += v.x / 200;
        //this.anchor.y += v.y / 200;

        //this.x += v.x;
        //this.y += v.y;
    };

    return pieces;
}

