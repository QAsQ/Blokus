var app = new PIXI.Application(1280, 1920, { backgroundColor: 0xFFFFFF});
document.body.appendChild(app.view);

gCellSize = 20;
gBoardSize = gCellSize * 20;
gPlayerId = 1;

function ColorThemeFactory(type) {
    if (type === "default") {
        return {
            boardBackgroundColor: 0xffffff,
            //boardLineColor: "#e6eae9",
            boardLineColor: 0x000000,
            pieceColor: {
                "0": 0xed1c24,
                "1": 0x23b14d,
                "2": 0x00a2e8,
                "3": 0xffc90d,
               "-1": 0xb7b7b7
            },
            legal: "#6f645e",
            horn: "#d5d7d5",
            rim: "#875f5f",
            unlegal: "#e1d9c4",
            can: "#f5f9f8",
            frameColor: "#ffffff",
            shade: "#e6eae9",
            corner: function (o) {
                switch (o) {
                    case -1:
                        return "#e6eae9";
                    case 0:
                        return "#cf1b24";
                    case 1:
                        return "#239546";
                    case 2:
                        return "#0091cf";
                    case 3:
                        return "#ebb60d";
                }
                return null;
            }
        }
    }
    return null;
}

function CellFactory(cellColor, position){
    var graphics = new PIXI.Graphics();
    graphics.beginFill(cellColor, 1);
    graphics.drawRect(
        position.x * gCellSize,
        position.y * gCellSize,
        gCellSize,
        gCellSize
    );
    return new PIXI.Sprite(graphics.generateTexture());
}


/**
 *
 * @param colorTheme
 * @param state
 * @returns {*}
 * @constructor
 *
 *  board, piece manager
 *      根据传入的 state 来创建自己
 *      updateState 根据传入的 state 来更新
 *           棋子状态
 *           棋子位置
 *  知道哪个棋子是当前棋子，可以处理棋子的旋转，翻转
 *  在棋子被选择的时候更新当前棋子
 *  在棋子移动的时候根据当前位置是否为可落下的位置更新（棋子的透明度？落下按钮的可用性？）
 *  在棋子被松开的时候判断是否落下棋子并更新棋子
 *
 */
/*
state {
  4 * 玩家的状态


 4 * 21 Chess State
    是否被落下，落下的位置
 轮到的玩家


}
 */
function BoardFactory(colorTheme) {
    var graphics = new PIXI.Graphics();
    graphics.lineColor = colorTheme.boardLineColor;
    graphics.lineWidth = 1;

    //Draw board line
    for (var i = 0; i <= 20; i++) {
        graphics.moveTo(i * gCellSize, 0);
        graphics.lineTo(i * gCellSize, 20 * gCellSize);
        graphics.moveTo(0, i * gCellSize);
        graphics.lineTo(gCellSize * 20, i * gCellSize);
    }

    var board = new PIXI.Sprite(graphics.generateTexture());

    //TODO Adhoc
    board.x = 5  * gCellSize;
    board.y = 5  * gCellSize;

    function DragStartCallBack (id, position) {
        console.log(
            "Drag start" + id,
            Math.floor(position.x / gCellSize),
            Math.floor(position.y / gCellSize)
        );
    }
    function DragMoveCallBack(id, position) {
        console.log(
            "Drag move " + id,
            Math.floor(position.x / gCellSize),
            Math.floor(position.y / gCellSize)
        );
    }
    function DragEndCallBack (id) {
        console.log("DragEnd" + id);
    }

    //Create piece
    var pieceLists = [];
    for(var playerId = 0; playerId < 4; playerId ++) {
        var pieceList = [];
        for (var pieceId = 0; pieceId <= 20; pieceId++) {
            var piece = PieceFactory(
                pieceId,
                gPiecesCellList[pieceId],
                colorTheme.pieceColor[playerId],
                DragStartCallBack,
                DragMoveCallBack,
                DragEndCallBack
            );
            if (playerId === gPlayerId) {
                piece.x = gPiecesLocate[pieceId].x * gCellSize;
                piece.y = gPiecesLocate[pieceId].y * gCellSize;
            }
            else {
                piece.visible = false;
                piece.interactive = false;
            }
            pieceList.push(piece);
            board.addChild(piece);
        }
        pieceLists.push(pieceList);
    }
    board.pieceLists = pieceLists;
    //Create piece Done

    board.loadState = function(state) {
        //TODO
        //state.playerState;
        var _pieceLists = this.pieceLists;
        _pieceLists[0][2].visible = true;
        state.pieceState.forEach(function (pieceStateList, playerId) {
            var isCurrentPlayer = playerId == gPlayerId;
            pieceStateList.forEach(function (pieceState, pieceId) {
                console.log(1);
                if (pieceState.isDown) {
                    var currentPiece = _pieceLists[playerId][pieceId];
                    currentPiece.interactive = false;
                    currentPiece.visible = true;
                    //TODO set piece layer
                    //currentPiece.layer();
                    currentPiece.SetState(pieceState.state);
                    console.log(pieceState.x, pieceState.y);
                    currentPiece.x = pieceState.x * gCellSize;
                    currentPiece.y = pieceState.y * gCellSize;

                }
            })
        });
    };

    board.isPossiblePosition = function (pieceId, position) {
        if (pieceId > 20 || pieceId < 0)
            return false;
        var positionState = this.position;
        //if (this.cellList[gPlayerId][pieceId].)
        
    };
    return board;
}

var board = BoardFactory(ColorThemeFactory("default"));
board.loadState(AdhocstateGenerate());
app.stage.addChild(board);


