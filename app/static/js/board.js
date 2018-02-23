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
function BoardFactory(app, colorTheme, TryDropPiece, piecesCellList) {
    console.log(PIXI.display);
    var placedGroup = new PIXI.display.Group(-1, false); 
    var boardGroup = new PIXI.display.Group(0, false);
    var pieceGroup = new PIXI.display.Group(1, false);
    var draggedGroup = new PIXI.display.Group(2, false);
    [placedGroup, boardGroup, pieceGroup, draggedGroup].forEach(function(value, index, array){
        app.stage.addChild(new PIXI.display.Layer(value));
    });

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
    var boardShape = new PIXI.Sprite(graphics.generateTexture());
    boardShape.parentGroup = boardGroup;

    var board = new PIXI.Container();
    board.addChild(boardShape);

    //TODO Adhoc
    board.x = 4  * gCellSize;
    board.y = 4  * gCellSize;

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
    function DragEndCallBack(id, position) {
        data = {
            piece_id: id,
            position: position
        }
        TryDropPiece(data);
    }
    board.progressBars = []
    for (var player_id = 0; player_id < 4; player_id++) {
        progressBar = ProgressBarFactory(
            app,
            gProgressBarEndPointList[player_id * 2],
            gProgressBarEndPointList[player_id * 2 + 1],
            3, //width
            colorTheme.pieceColor[player_id.toString()]
        )
        progressBar.parentGroup = boardGroup
        board.addChild(progressBar)
        progressBar.setProgressRate(1);
        board.progressBars.push(progressBar);
    }

    //Create piece
    var pieceLists = [];
    for(var playerId = 0; playerId < 4; playerId ++) {
        var pieceList = [];
        for (var pieceId = 0; pieceId <= 20; pieceId++) {
            var piece = PieceFactory(
                pieceId,
                piecesCellList[pieceId],
                colorTheme.pieceColor[playerId],
                DragStartCallBack,
                DragMoveCallBack,
                DragEndCallBack
            );
            piece.parentGroup = pieceGroup;
            if (playerId === gPlayerId) {
                piece.x = gPiecesLocate[pieceId].x * gCellSize;
                piece.y = gPiecesLocate[pieceId].y * gCellSize;
            }
            else {
                piece.SetVisible(false)
                piece.SetInteractive(false)
            }
            pieceList.push(piece);
            board.addChild(piece);
        }
        pieceLists.push(pieceList);
    }
    board.pieceLists = pieceLists;
    //Create piece Done

    board.loadState = function(state) {
        //update progressBar
        for (var playerId = 0; playerId < 4; playerId ++) {
            var currentProgressBar = this.progressBars[playerId];
            currentProgressBar.setActivate(playerId === state.battle.current_player);
            currentProgressBar.setProgressRate(state.player_state[playerId].total_time_left, state.battle.total_time);
        }
        
        //TODO state.playerState;
        var _pieceLists = this.pieceLists;
        for (var playerId = 0; playerId < 4; playerId ++)
            for (var pieceId = 0; pieceId < 21; pieceId ++){
                _pieceLists[playerId][pieceId].SetVisible(playerId === gPlayerId);
                _pieceLists[playerId][pieceId].SetInteractive(playerId === gPlayerId);
            }

        state.board.history.forEach(function (piece) {
            var isCurrentPlayer = piece.player_id == gPlayerId;
            var currentPiece = _pieceLists[piece.player_id][piece.piece_id];

            currentPiece.SetInteractive(false);
            currentPiece.SetVisible(true);
            currentPiece.SetState(piece.position.state);
            currentPiece.x = piece.position.x * gCellSize;
            currentPiece.y = piece.position.y * gCellSize;

            currentPiece.parentGroup = placedGroup;
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