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

function ProgressBarFactory(stPoint, edPoint, player_id, colorTheme){
	var graphics = new PIXI.Graphics();
    graphics.beginFill(colorTheme.board.progress_bar.accuracy[player_id], 1);
	graphics.drawRect(0, 0, 1, 1)
	var progressBar = new PIXI.Sprite(graphics.generateTexture());
    graphics.beginFill(colorTheme.board.progress_bar.additional, 1);
	graphics.drawRect(0, 0, 1, 1)
	var additionalBar = new PIXI.Sprite(graphics.generateTexture());

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

    additionalBar.x = progressBar.x = startPoint.x
	additionalBar.y = progressBar.y = startPoint.y
	var length = distance(startPoint, endPoint);
	additionalBar.scale.x = progressBar.scale.x = length;
    additionalBar.scale.y = progressBar.scale.y = colorTheme.board.progress_bar.bar_width;
	additionalBar.rotation = progressBar.rotation = angle;

	progressBarContainer.addChild(progressBar)
	progressBarContainer.addChild(additionalBar)
	progressBarContainer.progressBar = progressBar;
    progressBarContainer.additional = false

    progressBarContainer.extremity = ParticleFactory(
        progressBar.rotation,
        colorTheme.board.progress_bar.accuracy[player_id]
    );
	progressBarContainer.addChild(progressBarContainer.extremity);
    progressBarContainer.extremity.rotation = angle

    progressBarContainer.additional_extremity = ParticleFactory(
        progressBar.rotation,
        colorTheme.board.progress_bar.additional
	);
	progressBarContainer.addChild(progressBarContainer.additional_extremity);
    progressBarContainer.additional_extremity.rotation = angle

    progressBarContainer.extremity.visible = false
    progressBarContainer.additional_extremity.visible = false

	var progressBarText = new PIXI.Text(
		"",
		new PIXI.TextStyle({
            fontSize: 20
        })
	);  
	progressBarText.updText= function(text){
		progressBarText.setText(text);
        progressBarText.rotation = angle

        var unitX = (endPoint.x - startPoint.x) / length;
        var unitY = (endPoint.y - startPoint.y) / length;
        if (angle < Math.PI * 0.5)
        {
            progressBarText.x = startPoint.x + unitY * progressBarText.height;
            progressBarText.y = startPoint.y - unitX * progressBarText.height;
        }
        else{
            progressBarText.x = startPoint.x + unitX * progressBarText.width;
            progressBarText.y = startPoint.y + unitY * progressBarText.width;
            progressBarText.scale.x = -1
            progressBarText.scale.y = -1
        }
	}
	progressBarText.updText('NaN/NaN');
	progressBarContainer.addChild(progressBarText);
	progressBarContainer.progressBarText = progressBarText;

	progressBarContainer.setActivate = function(active){
        if (!active){
            this.extremity.visible = false
            this.additional_extremity.visible = false
        }
        else{
            if (this.additional){
                this.additional_extremity.visible = true
                this.extremity.visible = false
            }
            else{
                this.additional_extremity.visible = false
                this.extremity.visible = true
            }
        }
	}
	//todo update set progress rate to set time
	progressBarContainer.setProgressRate = function(total_time_left, additional_time_left, total_time, additional_time){
		this.progressBarText.updText(
			formTime(total_time_left + additional_time_left) + " / " +
			formTime(additional_time) + "+" + formTime(total_time) 
        );
        this.additional = additional_time_left !== 0
		var total_rate = total_time_left / (total_time + additional_time);
		var total_end = {
			x: startPoint.x + (endPoint.x - startPoint.x) * total_rate,
			y: startPoint.y + (endPoint.y - startPoint.y) * total_rate
		}
		this.progressBar.scale.x = distance(startPoint, total_end)

		var additional_rate = (total_time_left + additional_time_left) / (total_time + additional_time);
		var additional_end = {
			x: startPoint.x + (endPoint.x - startPoint.x) * additional_rate,
			y: startPoint.y + (endPoint.y - startPoint.y) * additional_rate 
		}
		additionalBar.x = total_end.x
		additionalBar.y = total_end.y
		additionalBar.scale.x = distance(total_end, additional_end);

		this.extremity.x = additional_end.x
		this.extremity.y = additional_end.y
		this.additional_extremity.x = additional_end.x
		this.additional_extremity.y = additional_end.y
	}
    return progressBarContainer;
}

function PieceFactory(pieceId,
                      shape,
                      offset,
                      player_id,
                      colorTheme,
                      DragStartCallBack,
                      DragMoveCallBack,
                      DragEndCallBack) {
    function onDragStart(event) {
        this.data = event.data;
        this.anchorPoint = this.data.getLocalPosition(this);
        this.alpha = colorTheme.piece.onselect_alpha;
        this.dragging = true;
        DragStartCallBack(this, this.State());
    }

    function onDragMove() {
        if (this.dragging) {
            var new_position = this.data.getLocalPosition(this.parent);
            this.x = new_position.x - this.anchorPoint.x;
            this.y = new_position.y - this.anchorPoint.y;
            this.x = Math.max(this.x, -offset.x)
            this.y = Math.max(this.y, -offset.y)
            this.x = Math.min(this.x, gWidth - offset.x - this.width)
            this.y = Math.min(this.y, gHeight - offset.y - this.height)

            DragMoveCallBack(this, this.State());
        }
    }

    function onDragEnd() {
        this.alpha = colorTheme.piece.initial_alpha
        this.dragging = false;
        this.data = null;
        if (true)
            DragEndCallBack(this, this.State());
    }

    function CellList_2_Polygon(cell_list, offset){
        var vertex_list = [new PIXI.Point(0, 0)];
        cell_list.forEach(function (cell) {
            [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]].forEach(function (point) {
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
    pieces.piece_id = pieceId
    pieces.piece = []

    function generateTexture(cellList, color){
        var graphics = new PIXI.Graphics();
        graphics.beginFill(color, 1);

        var polygon = CellList_2_Polygon(cellList, new PIXI.Point());
        graphics.drawPolygon(polygon);

        graphics.lineColor = colorTheme.piece.dividing_line;
        graphics.lineWidth = colorTheme.piece.dividing_line_width;
        cellList.forEach(function (cell){
            last = [0, 0]
            lis = [[1, 0], [1, 1], [0, 1], [0, 0]]
            lis.forEach(function (bias){
                graphics.moveTo((cell[0] + bias[0]) * gCellSize, (cell[1] + bias[1]) * gCellSize);
                graphics.lineTo((cell[0] + last[0]) * gCellSize, (cell[1] + last[1]) * gCellSize);
                last = bias
            })
        });
        return graphics.generateTexture()
    }

    shape.forEach(function(cellList, state){

        var piece = new PIXI.Sprite(generateTexture(cellList, colorTheme.piece.cell[player_id]));
        piece.cellList = cellList;
        piece.visible = false;

        piece.shadow = new PIXI.Sprite(generateTexture(cellList, colorTheme.piece.shadow))
        piece.shadow.visible = false
        piece.addChild(piece.shadow);

        pieces.piece.push(piece);
        pieces.addChild(piece);
    })

    pieces.alpha = colorTheme.piece.initial_alpha
    pieces.anchor = new PIXI.Point();
    pieces.interactive = true
    pieces.dropped = false
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

    pieces.activeShadow = function(shadowGroup, x, y){
        var piece = this.piece[this.state]
        piece.shadow.parentGroup = shadowGroup;
        piece.shadow.visible = true
        piece.shadow.x = x
        piece.shadow.y = y
    }

    pieces.deactiveShadow = function(){
        this.piece.forEach(function (piece){
            piece.shadow.visible = false
        })
    }

    pieces.SetOwnership= function(rights){
        pieces.visible = rights
        if(!pieces.dropped)
            pieces.interactive = rights
    }

    pieces.DropDown = function(){
        pieces.dropped = true
        pieces.visible = true
        pieces.interactive = false
        pieces.alpha = colorTheme.piece.dropped_alpha
    }

    pieces.PickUp= function(rights){
        pieces.dropped = false
        pieces.alpha =  pieces.dragging ? colorTheme.piece.onselect_alpha : colorTheme.piece.initial_alpha
        pieces.SetOwnership(rights)
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

//TODO
/*
function CheckerFactory(piece_shape_set, player_id){
    //not start
    return {
        board: [][],
        possible: [round][pieceid][state][x][y],
        piece_shape_set: piece_shape_set,
        load_state: function(state){

        },
        check_state: function(piece_id){

        }
    }
}
*/

function HighlightLayerFactory(colorTheme, piecesCellList){
    
    var highlightLayer = new PIXI.Container();
    function highlightCellGenerate(color, player_id){
        var graphics = new PIXI.Graphics();

        var player_shape = [
            [
                        [0, 1], [0, 2],
                [1, 0], [1, 1],        
                [2, 0],         [2, 2]
            ],
            [
                [0, 0], [0, 1],        
                        [1, 1], [1, 2],
                [2, 0],         [2, 2]
            ],
            [
                [0, 0],         [0, 2],
                        [1, 1], [1, 2],
                [2, 0], [2, 1]
            ],
            [
                [0, 0],         [0, 2],
                [1, 0], [1, 1],        
                        [2, 1], [2, 2]
            ]
        ]

        graphics.beginFill(color, 1);
        lCellSize = (gCellSize - colorTheme.piece.dividing_line_width) / 3 - 1
        player_shape[player_id].forEach(function(shape){
            graphics.drawRect(
                shape[0] * lCellSize + colorTheme.piece.dividing_line_width, 
                shape[1] * lCellSize + colorTheme.piece.dividing_line_width, 
                lCellSize, lCellSize);
        })

        graphics.lineColor = colorTheme.piece.dividing_line;
        graphics.lineWidth = colorTheme.piece.dividing_line_width;
        last = [0, 0]
        lis = [[1, 0], [1, 1], [0, 1], [0, 0]]
        lis.forEach(function (bias){
            graphics.moveTo(bias[0] * gCellSize, bias[1] * gCellSize);
            graphics.lineTo(last[0] * gCellSize, last[1] * gCellSize);
            last = bias
        })

        var highlightCell = new PIXI.Sprite(graphics.generateTexture());
        highlightCell.visible = false
        return highlightCell
    }

    var max_size = 0
    piecesCellList.forEach(function(cellLists){
        cellLists.forEach(function(cellList){
            max_size = Math.max(max_size, cellList.length)
        })
    })
    highlightLayer.highlightCells = []
    for (var player_id = 0; player_id < 4; player_id++)
    {
        cells = []
        for (var i = 0; i < max_size; i ++){
            var highlightCell = highlightCellGenerate(
                colorTheme.piece.last_drop[player_id], 
                player_id
            )
            cells.push(highlightCell)
            highlightLayer.addChild(highlightCell)
        }
        highlightLayer.highlightCells.push(cells)
    }

    highlightLayer.updateHighlight = function(history, length){
        this.highlightCells.forEach(function(highlightCell){
            highlightCell.forEach(function(cell){
                cell.visible = false
            })
        })
        last_drop = [-1, -1, -1, -1]
        for (var index = 0 ; index < length; index++){
            drop = history[index]
            last_drop[drop.player_id] = drop
        }
        for (var player_id = 0; player_id < 4; player_id ++){
            if (last_drop[player_id] === -1)
                continue
            var drop = last_drop[player_id]
            shape = piecesCellList[drop.piece_id][drop.position.state]
            for (var index = 0; index < shape.length; index++){
                var cells = highlightLayer.highlightCells[player_id];
                cells[index].x = (shape[index][0] + drop.position.x) * gCellSize
                cells[index].y = (shape[index][1] + drop.position.y) * gCellSize
                cells[index].visible = true
            }
        }
    }
    return highlightLayer;
}

function BoardFactory(app, mPlayerId, colorTheme, TryDropPiece, piecesCellList) {
    var placedGroup = new PIXI.display.Group(-2, false); 
    var boardGroup = new PIXI.display.Group(-1, false);
    var highlightGrop = new PIXI.display.Group(0, false);
    var shadowGroup = new PIXI.display.Group(1, false);
    var pieceGroup = new PIXI.display.Group(2, false);
    var draggedGroup = new PIXI.display.Group(3, false);
    [placedGroup, boardGroup, highlightGrop, shadowGroup, pieceGroup, draggedGroup].forEach(function(value, index, array){
        app.stage.addChild(new PIXI.display.Layer(value));
    });

    var graphics = new PIXI.Graphics();

    graphics.lineColor = colorTheme.board.dividing_line
    graphics.lineWidth = colorTheme.board.dividing_line_width
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

    current_piece_id = -1
    function DragStartCallBack (piece, position) {
        current_piece_id = piece.piece_id;
        piece.parentGroup = draggedGroup
        piece.activeShadow(shadowGroup, position.x * gCellSize - piece.x, position.y * gCellSize - piece.y)
        console.log(
            "Drag start" + piece.piece_id,
            position.x,
            position.y
        );
    }
    function DragMoveCallBack(piece, position) {
        piece.activeShadow(shadowGroup, position.x * gCellSize - piece.x, position.y * gCellSize - piece.y)
        console.log(
            "Drag move " + piece.piece_id,
            position.x,
            position.y
        );
    }
    function DragEndCallBack(piece, position) {
        piece.deactiveShadow()
        piece.parentGroup = pieceGroup
        data = {
            player_id: mPlayerId,
            piece_id: piece.piece_id,
            position: position
        }
        TryDropPiece(data)
    }
    board.progressBars = []
    for (var player_id = 0; player_id < 4; player_id++) {
        progressBar = ProgressBarFactory(
            gProgressBarEndPointList[player_id * 2],
            gProgressBarEndPointList[player_id * 2 + 1],
            player_id,
            colorTheme
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
                new PIXI.Point(board.x, board.y),
                playerId,
                colorTheme,
                DragStartCallBack,
                DragMoveCallBack,
                DragEndCallBack
            );
            piece.parentGroup = pieceGroup;
            piece.x = gPiecesLocate[pieceId].x * gCellSize;
            piece.y = gPiecesLocate[pieceId].y * gCellSize;
            piece.SetState(gInitState[pieceId])
            if (playerId !== mPlayerId) 
                piece.SetOwnership(false)
            pieceList.push(piece);
            board.addChild(piece);
        }
        pieceLists.push(pieceList);
    }
    board.pieceLists = pieceLists;
    //Create piece Done

    board.highlightLayer = HighlightLayerFactory(colorTheme,  piecesCellList)
    board.highlightLayer.parentGroup = highlightGrop
    board.addChild(board.highlightLayer)

    board.loadState = function(state, position) {
        //update progressBar
        for (var playerId = 0; playerId < 4; playerId ++) {
            var currentProgressBar = this.progressBars[playerId];
            currentProgressBar.setProgressRate(
                state.players_info[playerId].accuracy_time_left, 
                state.players_info[playerId].additional_time_left, 
                state.battle_info.accuracy_time,
                state.battle_info.additional_time
            )
            currentProgressBar.setActivate(!state.battle_info.ended && playerId === state.battle_info.current_player);
        }
        
        var _pieceLists = this.pieceLists;
        for (var playerId = 0; playerId < 4; playerId ++){
            for (var pieceId = 0; pieceId < 21; pieceId ++){
                _pieceLists[playerId][pieceId].PickUp(playerId === mPlayerId)
            }
        }
        var length = state.board_info.history.length
        if (position !== -1)
            length = Math.min(length, position)
        for (var index = 0 ; index < length; index++){
            var piece = state.board_info.history[index]
        
            var isCurrentPlayer = piece.player_id == mPlayerId;
            var currentPiece = _pieceLists[piece.player_id][piece.piece_id];

            currentPiece.DropDown();
            currentPiece.SetState(piece.position.state);
            currentPiece.x = piece.position.x * gCellSize;
            currentPiece.y = piece.position.y * gCellSize;

            currentPiece.parentGroup = placedGroup;
        }

        board.highlightLayer.updateHighlight(state.board_info.history, length)
    };
    board.update_player = function(playerId){
        mPlayerId = playerId
        for(var player_id = 0; player_id < 4; player_id++) {
            board.pieceLists[player_id].forEach(piece => {
                piece.SetOwnership(player_id === mPlayerId)
            })
        }
    };

    board.isPossiblePosition = function (pieceId, position) {
        if (pieceId > 20 || pieceId < 0)
            return false;
        var positionState = this.position;
        //if (this.cellList[mPlayerId][pieceId].)
        
    };

    window.addEventListener(
        "keydown", 
        function(event){
            if (current_piece_id === -1)    
                return
            if (event.key == "w" || event.key == "s")
                board.pieceLists[mPlayerId][current_piece_id].Flip();
            if (event.key == "a" || event.key == "d")
                board.pieceLists[mPlayerId][current_piece_id].Rotate(event.key == 'a');
        },
        false
    );

    return board;
}

function generateBoard(canvas, mPlayerId, boardData, colorTheme){
    gWidth = canvas.width;
    gHeight = canvas.height;

    var app = new PIXI.Application(
        gWidth, 
        gHeight, 
        {
            backgroundColor: colorTheme.backgroundColor, 
            view: canvas
        }
    );
    app.stage = new PIXI.display.Stage();

    gCellSize = Math.floor(Math.min(gWidth, gHeight) / 28)
    gBoardSize = gCellSize * 20;

    function TryDropPiece(data){
        $.ajax({
            method: "POST",
            url:"/api/battles/" + battle_inferface.battle_data.battle_id,
            data: JSON.stringify(data),
            contentType: 'application/json; charset=UTF-8',
            success: function(data){
                if (data.message == "success"){
                    battle_inferface.battle_data = data.result
                }
                else{
                    show_message(data.message)
                }
            },
            error: function(data){
                show_message("请求失败，请检查网络连接")
            }
        })
    }

    var board = BoardFactory(app, mPlayerId, colorTheme, TryDropPiece, boardData)
    app.stage.addChild(board);

    return board;
}