function ParticleFactory(direction, particleColor) {
	particle_config = {
		"alpha": {
			"start": 1,
			"end": 0
		},
		"scale": {
			"start": 0.1,
			"end": 0.01,
			"minimumScaleMultiplier": 1
		},
		"color": {
			"start": particleColor.toString(16),
			"end": "#FFFFFF"
		},
		"speed": {
			"start": 50,
			"end": 10,
			"minimumSpeedMultiplier": 1
		},
		"acceleration": {
			"x": 0,
			"y": 0
		},
		"maxSpeed": 0,
		"startRotation": {
			"min": -15,
			"max": 15
		},
		"noRotation": false,
		"rotationSpeed": {
			"min": 0,
			"max": 0
		},
		"lifetime": {
			"min": 0.5,
			"max": 1.5
		},
		"blendMode": "normal",
		"frequency": 0.001,
		"emitterLifetime": -1,
		"maxParticles": 500,
		"pos": {
			"x": 0,
			"y": 0
		},
		"addAtBack": false,
		"spawnType": "rect",
		"spawnRect": {
			"x": 0,
			"y": 0,
			"w": 3,
			"h": 3
		}
	}
    var emitter = null
    // Calculate the current time
    
	var elapsed = Date.now();

    var updateId;
    var update = function(){
	    updateId = requestAnimationFrame(update);
        var now = Date.now();
        if (emitter)
            emitter.update((now - elapsed) * 0.0025);
        
		elapsed = now;
    };

	// Create the new emitter and attach it to the stage
	var emitterContainer = new PIXI.Container();

	var emitter = new PIXI.particles.Emitter(
		emitterContainer,
		[PIXI.Texture.fromImage("/static/pixi/images/image.png")],
		particle_config
	);
	emitter.particleConstructor = PIXI.particles.PathParticle;
	
	update();

	return emitterContainer
}

function ProgressBarFactory(stPoint, edPoint, width, progressBarColor, tempBarColor){
	var graphics = new PIXI.Graphics();
    graphics.beginFill(progressBarColor, 1);
	graphics.drawRect(0, 0, 1, 1)
	var progressBar = new PIXI.Sprite(graphics.generateTexture());
    graphics.beginFill(tempBarColor, 1);
	graphics.drawRect(0, 0, 1, 1)
	var tempBar = new PIXI.Sprite(graphics.generateTexture());

	var startPoint = Point(stPoint.x * gCellSize, stPoint.y * gCellSize);
	var endPoint = Point(edPoint.x * gCellSize, edPoint.y * gCellSize);

    function distance(pointA, pointB){
        return Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y))
	}
	
	function formTime(time){
		minute = Math.floor(time / 60)
		seconds = (time % 60)
		if (seconds <= 9)
			seconds = "0" + seconds.toString()
		return minute + ":" + seconds
	}
    var angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x)

	var progressBarContainer = new PIXI.Container();

    tempBar.x = progressBar.x = startPoint.x
	tempBar.y = progressBar.y = startPoint.y
	var length = distance(startPoint, endPoint);
	tempBar.scale.x = progressBar.scale.x = length;
    tempBar.scale.y = progressBar.scale.y = width;
	tempBar.rotation = progressBar.rotation = angle;

	progressBarContainer.addChild(progressBar)
	progressBarContainer.addChild(tempBar)
	progressBarContainer.progressBar = progressBar;

    progressBarContainer.extremity = ParticleFactory(
		progressBar.rotation,
		progressBarColor
	);

	progressBarContainer.addChild(progressBarContainer.extremity);
	progressBarContainer.extremity.rotation = angle
	progressBarContainer.extremity.x = endPoint.x
	progressBarContainer.extremity.y = endPoint.y
	progressBarContainer.extremity.visible = false

	var progressBarText = new PIXI.Text(
		"",
		new PIXI.TextStyle({
            fontSize: 1
        })
	);  
	progressBarText.updText= function(text){
		//Todo,not such right, need fix
		progressBarText.setText(text);
		progressBarText.rotation = angle
		if (Math.PI * 0.5 < angle && angle < Math.PI * 1.5)
		{
			var unitX = (endPoint.x - startPoint.x) / length;
			var unitY = (endPoint.y - startPoint.y) / length;
			progressBarText.scale.x = -1;
			progressBarText.scale.y = -1;
			progressBarText.x = startPoint.x + unitX * progressBarText.width;
			progressBarText.y = startPoint.y + unitY * progressBarText.width;
		}
		else
		{
			progressBarText.x = startPoint.x;  
			progressBarText.y = startPoint.y;  
		}
	}
	progressBarText.updText('NaN/NaN');
	progressBarContainer.addChild(progressBarText);
	progressBarContainer.progressBarText = progressBarText;

	progressBarContainer.setActivate = function(active){
		this.extremity.visible = active;
	}
	//todo update set progress rate to set time
	progressBarContainer.setProgressRate = function(total_time_left, temp_time_left, total_time, temp_time){
		this.progressBarText.updText(
			formTime(total_time_left + temp_time_left) + " / " +
			formTime(temp_time) + "+" + formTime(total_time) 
		);
		var total_rate = total_time_left / (total_time + temp_time);
		var total_end = {
			x: startPoint.x + (endPoint.x - startPoint.x) * total_rate,
			y: startPoint.y + (endPoint.y - startPoint.y) * total_rate
		}
		this.progressBar.scale.x = distance(startPoint, total_end)

		var temp_rate = (total_time_left + temp_time_left) / (total_time + temp_time);
		var temp_end = {
			x: startPoint.x + (endPoint.x - startPoint.x) * temp_rate,
			y: startPoint.y + (endPoint.y - startPoint.y) * temp_rate 
		}
		tempBar.x = total_end.x
		tempBar.y = total_end.y
		tempBar.scale.x = distance(total_end, temp_end);

		this.extremity.x = temp_end.x
		this.extremity.y = temp_end.y
	}
    return progressBarContainer;
}

/**
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
function BoardFactory(app, colorTheme, TryDropPiece, piecesCellList) {
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

    current_piece = -1
    function DragStartCallBack (id, position) {
        current_piece = id;
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
            gProgressBarEndPointList[player_id * 2],
            gProgressBarEndPointList[player_id * 2 + 1],
            3, //width
            colorTheme.pieceColor[player_id.toString()],
            colorTheme.tempColor
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
            currentProgressBar.setActivate(playerId === state.battle_info.current_player);
            currentProgressBar.setProgressRate(
                state.players_info[playerId].accuracy_time_left, 
                state.players_info[playerId].additional_time_left, 
                state.battle_info.accuracy_time,
                state.battle_info.additional_time
            )
        }
        
        //TODO state.playerState;
        var _pieceLists = this.pieceLists;
        for (var playerId = 0; playerId < 4; playerId ++){
            for (var pieceId = 0; pieceId < 21; pieceId ++){
                _pieceLists[playerId][pieceId].SetVisible(playerId === gPlayerId);
                _pieceLists[playerId][pieceId].SetInteractive(playerId === gPlayerId);
            }
        }
        state.board_info.history.forEach(function (piece) {
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

    window.addEventListener(
        "keydown", 
        function(event){
            if (current_piece === -1)    
                return
            if (event.key == "w" || event.key == "s")
                board.pieceLists[gPlayerId][current_piece].Flip();
            if (event.key == "a" || event.key == "d")
                board.pieceLists[gPlayerId][current_piece].Rotate(event.key == 'a');
        },
        false
    );

    return board;
}

function generateBoard(canvas, boardData, colorTheme){
    gWidth = canvas.width;
    gHeight = canvas.height;

    var app = new PIXI.Application(
        gWidth, 
        gHeight, 
        {
            backgroundColor: 0xffffff, 
            view:canvas
        }
    );
    app.stage = new PIXI.display.Stage();

    gCellSize = Math.floor(Math.min(gWidth, gHeight) / 28)
    gBoardSize = gCellSize * 20;

    function TryDropPiece(){

    }

    var board = BoardFactory(app, colorTheme, TryDropPiece, boardData)
    app.stage.addChild(board);

    return board;
}