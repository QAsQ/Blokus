function square(x) {
    return x * x
}

var gOffsetX;
var Point = function (x, y) {
    return new PIXI.Point(x, y)
}
function liftPoint(x, y){
    return Point(x * gCellSize + y * gCellSize / 2 - gOffsetX, y * gCellSize / 2 * Math.sqrt(3));
}
function lowerPoint(x, y){
    //return Point(x / gCellSize, y / gCellSize);
    x += gOffsetX;
    var ly = y * 2 / (gCellSize * Math.sqrt(3));
    var lx = (x - ly * gCellSize / 2) / gCellSize; 
    return Point(lx, ly);
}
function middle(a, b){
    return Point((a.x + b.x) / 2, (a.y + b.y) / 2);
}
Point.from = function (point) {
    return Point(point[0], point[1])
}

function ParticleFactory(direction, particleColor, mobile_version) {
    particle_config = {
        "alpha": {
            "start": 1,
            "end": 0
        },
        "scale": {
            "start": mobile_version ? 0.05 : 0.2,
            "end": 0.9,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": particleColor.toString(16),
            "end": "#f2f0f1"
        },
        "speed": {
            "start": 90,
            "end": 0,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": mobile_version ? -22.5 : -45,
            "max": 0
        },
        "noRotation": false,
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.5,
            "max": mobile_version ? 1.5 : 2
        },
        "blendMode": "normal",
        "frequency": 0.01,
        "emitterLifetime": -1,
        "maxParticles": 80,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "rect",
        "spawnRect": {
            "x": 0,
            "y": 0,
            "w": mobile_version ? 1 : 7,
            "h": mobile_version ? 1 : 7
        }
    }
    var emitter = null
    // Calculate the current time

    var elapsed = Date.now();

    var updateId;
    var update = function () {
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
        [PIXI.Texture.fromImage("/static/images/pixi/image.png")],
        particle_config
    );
    emitter.particleConstructor = PIXI.particles.PathParticle;

    update();

    return emitterContainer
}

function PieceControllerFactory(colorTheme, controllerGroup) {
    var bodySize = 6
    var half_a = bodySize * (Math.SQRT2 - 1)
    var radius = (bodySize - 2) * gCellSize

    function generateGraphics(pointList, color, alpha) {
        var graphics = new PIXI.Graphics();
        var vertex_list = []
        pointList.forEach(function (point) {
            vertex_list.push(new PIXI.Point(point[0] * gCellSize, point[1] * gCellSize))
        })
        graphics.beginFill(color, alpha);
        graphics.drawPolygon(new PIXI.Polygon(vertex_list))
        graphics.endFill()
        return graphics
    }

    function generateConrtollerBody() {
        var path = [
            [bodySize, -half_a],
            [half_a, -bodySize],
            [-half_a, -bodySize],
            [-bodySize, -half_a],
            [-bodySize, half_a],
            [-half_a, bodySize],
            [bodySize, bodySize],
            [bodySize, -half_a]
        ]
        var graphics = generateGraphics(
            path,
            colorTheme.piece.controller.body.color,
            colorTheme.piece.controller.body.alpha
        )
        graphics.arc(0, 0, radius, 0, 2 * Math.PI);


        var body = new PIXI.Sprite(graphics.generateTexture())
        body.anchor.set(0.5)
        body.interactive = true
        return body
    }

    function generateTag(vertical) {
        function onDragStart(event) {
            this.dragging = true
            this.alpha = colorTheme.piece.controller.control_parts.active_alpha
            event.stopped = true
        }

        function onDragEnd() {
            if (this.dragging) {
                this.dragging = false
                this.alpha = colorTheme.piece.controller.control_parts.initial_alpha
                if (vertical)
                    this.parent.attachPiece.Flip()
                else
                    this.parent.attachPiece.HorizontalFlip()
            }
        }
        var graphics = generateGraphics(
            [
                [half_a, 0],
                [-half_a, 0],
                [0, -half_a],
            ],
            colorTheme.piece.controller.control_parts.color,
            1
        )
        var tag = new PIXI.Sprite(graphics.generateTexture())
        tag.anchor.x = 0.5
        tag.anchor.y = 1
        tag.alpha = colorTheme.piece.controller.control_parts.initial_alpha
        if (vertical)
            tag.y = -bodySize * gCellSize
        else {
            tag.x = -bodySize * gCellSize
            tag.rotation = -Math.PI / 2
        }

        tag.interactive = true
        tag
            .on('pointerdown', onDragStart)
            .on('pointerup', onDragEnd)
            .on('pointerupoutside', onDragEnd)
        return tag
    }

    function generateRotateCircle() {
        var graphics = new PIXI.Graphics()
        graphics.lineStyle(2, colorTheme.piece.controller.control_parts.color, 1)
        graphics.drawCircle(0, 0, radius)

        var thickWidth = gCellSize * Math.SQRT2
        graphics.lineWidth = thickWidth
        graphics.arc(0, 0, radius - thickWidth / 2, -Math.PI / 8 * 8, -Math.PI / 8 * 4)
        var rotateCircle = new PIXI.Sprite(graphics.generateTexture())
        rotateCircle.alpha = colorTheme.piece.controller.control_parts.initial_alpha
        rotateCircle.anchor.set(0.5)
        rotateCircle.interactive = true

        rotateCircle.getAngel = function (position) {
            return -(Math.atan2(position.x, position.y) + Math.PI / 4 * 3)
        }
        rotateCircle.getState = function () {
            var res = this.rotation
            if (res < 0)
                res += Math.PI * 2
            return Math.floor(res / Math.PI * 2 + 0.5) % 4
        }
        rotateCircle.Reset = function () {
            this.rotation = 0
            if (this.parent.attachPiece !== null)
                this.parent.attachPiece.rotation = 0
        }

        function onDragStart(event) {
            this.data = event.data;
            var position = this.data.getLocalPosition(this.parent);
            var distance = Math.sqrt(square(position.x) + square(position.y))
            if (distance < radius - thickWidth || distance > radius) {
                return
            } else {
                this.oldState = this.getState()
                this.dragging = true;
                this.alpha = colorTheme.piece.controller.control_parts.active_alpha
                this.rotation = this.getAngel(position)
                event.stopped = true
            }
        }

        function onDragMove() {
            if (this.dragging) {
                var position = this.data.getLocalPosition(this.parent);
                this.rotation = this.getAngel(position)
                this.parent.attachPiece.rotation = this.rotation - this.oldState * Math.PI / 2
            }
        }

        function onDragEnd() {
            if (this.dragging) {
                this.dragging = false
                this.data = null
                this.alpha = colorTheme.piece.controller.control_parts.initial_alpha
                piece = this.parent.attachPiece
                piece.rotation = 0
                var newState = this.getState()
                for (var i = 0; i < newState - this.oldState + 4; i++)
                    piece.Rotate(false)
                this.rotation = newState * Math.PI / 2
            }
        }
        rotateCircle
            .on('pointerdown', onDragStart)
            .on('pointerup', onDragEnd)
            .on('pointerupoutside', onDragEnd)
            .on('pointermove', onDragMove);
        return rotateCircle
    }

    function onDragStart(event) {
        this.data = event.data;
        this.anchorPoint = this.data.getLocalPosition(this);
        this.dragging = true;
        this.attachPiece.Select()
        event.stopped = true
    }

    function onDragMove() {
        if (this.dragging) {
            var new_position = this.data.getLocalPosition(this.parent);
            this.x = new_position.x - this.anchorPoint.x;
            this.y = new_position.y - this.anchorPoint.y;
            this.attachPiece.setCenter(this.x, this.y)
            this.attachPiece.Select()
            if (!this.attachPiece.insideBound())
                this.follow()
        }
    }

    function onDragEnd() {
        this.dragging = false;
        this.data = null;
        this.attachPiece.Unselect()
    }


    var pieceController = new PIXI.Container()
    pieceController.visible = false
    pieceController.parentGroup = controllerGroup
    pieceController.attachPiece = null
    pieceController.interactive = true
    pieceController
        .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);


    var conrtollerBody = generateConrtollerBody()
    pieceController.addChild(conrtollerBody)

    var horizontalTag = generateTag(true)
    pieceController.addChild(horizontalTag)

    var verticalTag = generateTag(false)
    pieceController.addChild(verticalTag)

    var rotateCircle = generateRotateCircle()
    pieceController.addChild(rotateCircle)

    pieceController.follow = function () {
        if (this.attachPiece === null)
            return
        var pieceCenter = this.attachPiece.getCenter()
        this.x = pieceCenter.x
        this.y = pieceCenter.y
    }

    pieceController.attach = function (piece) {
        if (this.attachPiece !== null)
            this.detach()
        this.attachPiece = piece
        this.visible = true
        this.follow()
    }

    pieceController.detach = function (piece) {
        if (piece === undefined || this.attachPiece == piece) {
            rotateCircle.Reset()
            this.attachPiece = null
            this.visible = false
        }
    }

    return pieceController;
}

function ProgressBarFactory(startPoint, endPoint, player_id, colorTheme, mobile_version) {
    var graphics = new PIXI.Graphics();
    graphics.beginFill(colorTheme.board.progress_bar.accuracy[player_id], 1);
    graphics.drawRect(0, 0, 1, 1)
    var progressBar = new PIXI.Sprite(graphics.generateTexture());
    graphics.beginFill(colorTheme.board.progress_bar.additional, 1);
    graphics.drawRect(0, 0, 1, 1)
    var additionalBar = new PIXI.Sprite(graphics.generateTexture());

    function distance(pointA, pointB) {
        return Math.sqrt(square(pointA.x - pointB.x) + square(pointA.y - pointB.y))
    }

    function formTime(time) {
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
    additionalBar.scale.y = progressBar.scale.y = colorTheme.board.progress_bar.bar_width[mobile_version];
    additionalBar.rotation = progressBar.rotation = angle;

    progressBarContainer.addChild(progressBar)
    progressBarContainer.addChild(additionalBar)
    progressBarContainer.progressBar = progressBar;
    progressBarContainer.additional = false

    progressBarContainer.extremity = ParticleFactory(
        progressBar.rotation,
        colorTheme.board.progress_bar.particles.accuracy[player_id],
        mobile_version
    );
    progressBarContainer.addChild(progressBarContainer.extremity);
    progressBarContainer.extremity.rotation = angle

    progressBarContainer.additional_extremity = ParticleFactory(
        progressBar.rotation,
        colorTheme.board.progress_bar.particles.additional
    );
    progressBarContainer.addChild(progressBarContainer.additional_extremity);
    progressBarContainer.additional_extremity.rotation = angle

    progressBarContainer.extremity.visible = false
    progressBarContainer.additional_extremity.visible = false

    var progressBarText = new PIXI.Text(
        "",
        new PIXI.TextStyle({
            fontSize: mobile_version ? 9 : 20
        })
    );
    progressBarText.updText = function (text) {
        progressBarText.setText(text);
        progressBarText.rotation = angle

        var unitX = (endPoint.x - startPoint.x) / length;
        var unitY = (endPoint.y - startPoint.y) / length;
        if (angle < Math.PI * 0.5) {
            progressBarText.x = startPoint.x + unitY * progressBarText.height;
            progressBarText.y = startPoint.y - unitX * progressBarText.height;
        } else {
            progressBarText.x = startPoint.x + unitX * progressBarText.width;
            progressBarText.y = startPoint.y + unitY * progressBarText.width;
            progressBarText.scale.x = -1
            progressBarText.scale.y = -1
        }
    }
    progressBarText.updText('NaN/NaN');
    progressBarContainer.addChild(progressBarText);
    progressBarContainer.progressBarText = progressBarText;

    progressBarContainer.setActivate = function (active) {
        if (!active) {
            this.extremity.visible = false
            this.additional_extremity.visible = false
        } else {
            if (this.additional) {
                this.additional_extremity.visible = true
                this.extremity.visible = false
            } else {
                this.additional_extremity.visible = false
                this.extremity.visible = true
            }
        }
    }
    //todo update set progress rate to set time
    progressBarContainer.setProgressRate = function (total_time_left, additional_time_left, total_time, additional_time) {
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

function PieceFactory(
    pieceId,
    shape,
    offset,
    player_id,
    colorTheme,
    mobile_version,
    pieceType,
    pieceGroup,
    shadowGroup,
    draggedGroup,
    TouchStartCallBack,
    DragStartCallBack,
    DragMoveCallBack,
    DragEndCallBack) {
    function onDragStart(event) {
        if (event.data.pointerType === "touch")
            TouchStartCallBack(this)
        this.data = event.data;
        this.anchorPoint = this.data.getLocalPosition(this);
        this.dragging = true;
        this.Select()
        DragStartCallBack(this, this.State())
        event.stopped = true
    }

    function onDragMove() {
        if (this.dragging) {
            var new_position = this.data.getLocalPosition(this.parent);
            this.x = new_position.x - this.anchorPoint.x;
            this.y = new_position.y - this.anchorPoint.y;

            this.insideBound()
            this.activeShadow()
            DragMoveCallBack(this, this.State())
        }
    }

    function onDragEnd() {
        this.Unselect()
        this.dragging = false;
        this.data = null;
        if (true)
            DragEndCallBack(this, this.State());
    }

    var pieces = new PIXI.Container();

    function generateSquareTexture(cellList, color) {
        function CellList_2_Polygon(cell_list) {
            var vertex_list = [new PIXI.Point(0, 0)];
            cell_list.forEach(function (cell) {
                [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]].forEach(function (point) {
                    vertex_list.push(
                        new PIXI.Point(
                            (cell[0] + point[0]) * gCellSize,
                            (cell[1] + point[1]) * gCellSize,
                ))})
                vertex_list.push(new PIXI.Point(0, 0));
            });
            return new PIXI.Polygon(vertex_list);
        }
        var graphics = new PIXI.Graphics();
        graphics.beginFill(color, 1);
        var polygon = CellList_2_Polygon(cellList);
        graphics.drawPolygon(polygon);

        graphics.lineColor = colorTheme.piece.dividing_line;
        graphics.lineWidth = colorTheme.piece.dividing_line_width[mobile_version];
        cellList.forEach(function (cell) {
            last = [0, 0]
            lis = [[1, 0], [1, 1], [0, 1], [0, 0]]
            lis.forEach(function (bias) {
                graphics.moveTo((cell[0] + bias[0]) * gCellSize, (cell[1] + bias[1]) * gCellSize);
                graphics.lineTo((cell[0] + last[0]) * gCellSize, (cell[1] + last[1]) * gCellSize);
                last = bias
            })
        });
        return graphics.generateTexture()
    }
    function getSquareOffset(cellList) {
        var x = 0, y = 0;
        cellList.forEach(function (point) {
            x = Math.max(x, point[0] + 1)
            y = Math.max(y, point[1] + 1)
        })
        return new PIXI.Point(x * gCellSize / 2, y * gCellSize / 2)
    }

    function generateTrigonTexture(cellList, color) {
        function CellList_2_Polygon(cell_list) {
            var vertex_list = [new PIXI.Point(0, 0)];
            cell_list.forEach(function (cell) {
                var tip = liftPoint(cell[0] + cell[2], cell[1] + cell[2])
                vertex_list = vertex_list.concat([
                    tip,
                    liftPoint(cell[0] + 1, cell[1]),
                    liftPoint(cell[0], cell[1] + 1),
                    tip,
                    Point(0, 0),
                ])
            });
            return new PIXI.Polygon(vertex_list);
        }
        var graphics = new PIXI.Graphics();
        graphics.beginFill(color, 1);
        var polygon = CellList_2_Polygon(cellList);
        graphics.drawPolygon(polygon);

        graphics.lineColor = colorTheme.piece.dividing_line;
        graphics.lineWidth = colorTheme.piece.dividing_line_width[mobile_version];
        cellList.forEach(function (cell) {
            var tip = liftPoint(cell[0] + cell[2], cell[1] + cell[2])
            var pointL = liftPoint(cell[0] + 1, cell[1]);
            var pointR = liftPoint(cell[0], cell[1] + 1);
            graphics.moveTo(tip.x, tip.y);
            graphics.lineTo(pointL.x, pointL.y);
            graphics.lineTo(pointR.x, pointR.y);
            graphics.lineTo(tip);
        });
        return graphics.generateTexture()
    }
    function getTrigonOffset(cellList) {
        var x = 0, y = 0;
        cellList.forEach(function (point) {
            x = Math.max(x, point[0] + 1)
            y = Math.max(y, point[1] + 1)
        })
        return new PIXI.Point(x * gCellSize / 2, y * gCellSize / 2)
    }

    if (pieceType === 'square'){
        var generateTexture = generateSquareTexture
        var getOffset = getSquareOffset
    }
    else if (pieceType === 'trigon'){
        var generateTexture = generateTrigonTexture
        var getOffset = getTrigonOffset
    }

    pieces.piece_id = pieceId
    pieces.piece = []
    //generate piece shape
    shape.forEach(function (cellList, state) {
        var piece = new PIXI.Sprite(generateTexture(cellList, colorTheme.piece.cell[player_id]));
        piece.cellList = cellList
        piece.offset = Point(piece.width / 2, piece.height / 2) 
        piece.visible = false
        piece.anchor.set(0.5)

        piece.shadow = new PIXI.Sprite(generateTexture(cellList, colorTheme.piece.shadow))
        piece.shadow.visible = false
        piece.shadow.parentGroup = shadowGroup
        piece.addChild(piece.shadow)

        pieces.piece.push(piece)
        pieces.addChild(piece)
    })
    
    //adhoc for trigon
    for (var i = 0; i < shape.length; i ++){
        var exOffset = gCellSize / 2;
        if (pieceType === 'square')
            exOffset = 0;
        shape[i].forEach(function(cell){
            if (cell[0] === 0 && cell[1] === 0 && cell[2] === 0)
                exOffset = 0
        })
        pieces.piece[i].exOffset = exOffset;
    }

    pieces.alpha = colorTheme.piece.initial_alpha
    pieces.interactive = true
    pieces.dropped = false
    pieces.parentGroup = pieceGroup
    pieces
        .on('pointerdown', onDragStart)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)
        .on('pointermove', onDragMove);

    pieces.SetState = function (state) {
        if (typeof (this.state) !== "undefined")
            this.piece[this.state].visible = false;
        this.state = state;
        this.piece[state].visible = true;
    };
    pieces.SetState(0);

    pieces.insideBound = function () {
        var pieceOffset = this.piece[this.state].offset
        var oldX = this.x,
            oldY = this.y
        this.x = Math.max(this.x, -offset.x + pieceOffset.x)
        this.y = Math.max(this.y, -offset.y + pieceOffset.y)
        this.x = Math.min(this.x, gWidth - offset.x - pieceOffset.x)
        this.y = Math.min(this.y, gHeight - offset.y - pieceOffset.y)
        return oldX === this.x && oldY === this.y
    }

    pieces.Select = function () {
        this.alpha = colorTheme.piece.onselect_alpha;
        this.parentGroup = draggedGroup
        this.activeShadow()
    }

    pieces.Unselect = function () {
        this.alpha = colorTheme.piece.initial_alpha
        this.parentGroup = pieceGroup
        this.deactiveShadow()
    }

    if (pieceType === 'square'){
        pieces.State = function () {
            var piece = this.piece[this.state]
            return {
                state: this.state,
                x: Math.floor((this.x - piece.offset.x) / gCellSize + 0.5),
                y: Math.floor((this.y - piece.offset.y) / gCellSize + 0.5)
            }
        }
    }
    else{
        pieces.State = function () {
            var piece = this.piece[this.state]
            var x = this.x - piece.offset.x - piece.exOffset
            var y = this.y - piece.offset.y
            var lower = lowerPoint(x, y)
            return {
                state: this.state,
                x: Math.floor(lower.x + 0.5),
                y: Math.floor(lower.y + 0.5)
            }
        }
    }

    if (pieceType === 'square'){
        pieces.SetPosition = function (position) {
            var piece = this.piece[this.state];
            this.x = position.x * gCellSize + piece.offset.x;
            this.y = position.y * gCellSize + piece.offset.y;
        }
    }
    else{
        pieces.SetPosition = function (position) {
            position = liftPoint(position.x, position.y);
            var piece = this.piece[this.state];
            this.x = position.x + piece.offset.x + piece.exOffset;
            this.y = position.y + piece.offset.y;
        }
    }

    pieces.getCenter = function () {
        return new PIXI.Point(this.x, this.y)
    }
    pieces.setCenter = function (x, y) {
        this.x = x
        this.y = y
    }

    pieces.activeShadow = function () {
        var position = this.State()
        var piece = this.piece[this.state]
        piece.shadow.visible = true
        if (pieceType === 'square'){
            piece.shadow.x = position.x * gCellSize - this.x,
            piece.shadow.y = position.y * gCellSize - this.y
        }
        else{
            var lposition = liftPoint(position.x, position.y)
            piece.shadow.x = lposition.x - this.x + piece.exOffset,
            piece.shadow.y = lposition.y - this.y
        }
    }

    pieces.deactiveShadow = function () {
        this.piece.forEach(function (piece) {
            piece.shadow.visible = false
        })
    }

    pieces.SetOwnership = function (rights) {
        pieces.visible = rights
        if (!pieces.dropped)
            pieces.interactive = rights
    }

    pieces.DropDown = function () {
        pieces.dropped = true
        pieces.visible = true
        pieces.interactive = false
        pieces.alpha = colorTheme.piece.dropped_alpha
        pieces.deactiveShadow()
    }

    pieces.PickUp = function (rights) {
        pieces.dropped = false
        pieces.alpha = pieces.dragging ? colorTheme.piece.onselect_alpha : colorTheme.piece.initial_alpha
        pieces.SetOwnership(rights)
        pieces.parentGroup = pieceGroup
    }

    pieces.Flip = function () {
        if (pieces.dropped == false) {
            var new_state = this.state ^ 1
            this.SetState(new_state);
        }
    };
    pieces.HorizontalFlip = function () {
        if (pieces.dropped == false) {
            if (pieceType == square)
                var new_state = (this.state + ((this.state % 2) ? 3 : 5)) % 8
            else
                var new_state = (this.state + ((this.state % 2) ? 7 : 5)) % 12
            this.SetState(new_state);
        }
    }
    pieces.Rotate = function (clock) {
        if (pieces.dropped == false) {
            if (pieceType == square)
                var new_state = (this.state + ((this.state % 2) ^ clock ? 2 : 6)) % 8
            else
                var new_state = (this.state + ((this.state % 2) ^ clock ? 2 : 10)) % 12
            this.SetState(new_state);
        }
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

function SquareHighlightLayerFactory(colorTheme, player_num, mobile_version, piecesCellList) {

    var highlightLayer = new PIXI.Container();

    function highlightCellGenerate(color, player_id) {
        var graphics = new PIXI.Graphics();

        var player_shape = [
            [[0, 1], [0, 2], [1, 0], [1, 1], [2, 0], [2, 2]],
            [[0, 0], [0, 1], [1, 1], [1, 2], [2, 0], [2, 2]],
            [[0, 0], [0, 2], [1, 1], [1, 2], [2, 0], [2, 1]],
            [[0, 0], [0, 2], [1, 0], [1, 1], [2, 1], [2, 2]]
        ]

        graphics.beginFill(color, 1);
        lCellSize = (gCellSize - colorTheme.piece.dividing_line_width[mobile_version]) / 3 - 1
        player_shape[player_id].forEach(function (shape) {
            graphics.drawRect(
                shape[0] * lCellSize + colorTheme.piece.dividing_line_width[mobile_version],
                shape[1] * lCellSize + colorTheme.piece.dividing_line_width[mobile_version],
                lCellSize, lCellSize);
        })

        graphics.lineColor = colorTheme.piece.dividing_line;
        graphics.lineWidth = colorTheme.piece.dividing_line_width[mobile_version];
        last = [0, 0]
        lis = [
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0]
        ]
        lis.forEach(function (bias) {
            graphics.moveTo(bias[0] * gCellSize, bias[1] * gCellSize);
            graphics.lineTo(last[0] * gCellSize, last[1] * gCellSize);
            last = bias
        })

        var highlightCell = new PIXI.Sprite(graphics.generateTexture());
        highlightCell.visible = false
        return highlightCell
    }

    var max_size = 0
    piecesCellList.forEach(function (cellLists) {
        cellLists.forEach(function (cellList) {
            max_size = Math.max(max_size, cellList.length)
        })
    })
    highlightLayer.highlightCells = []
    for (var player_id = 0; player_id < player_num; player_id++) {
        cells = []
        for (var i = 0; i < max_size; i++) {
            var highlightCell = highlightCellGenerate(
                colorTheme.piece.last_drop[player_id],
                player_id
            )
            cells.push(highlightCell)
            highlightLayer.addChild(highlightCell)
        }
        highlightLayer.highlightCells.push(cells)
    }

    highlightLayer.updateHighlight = function (history, length) {
        this.highlightCells.forEach(function (highlightCell) {
            highlightCell.forEach(function (cell) {
                cell.visible = false
            })
        })
        last_drop = [-1, -1, -1, -1]
        for (var index = 0; index < length; index++) {
            drop = history[index]
            last_drop[drop.player_id] = drop
        }
        for (var player_id = 0; player_id < player_num; player_id++) {
            if (last_drop[player_id] === -1)
                continue
            var drop = last_drop[player_id]
            shape = piecesCellList[drop.piece_id][drop.position.state]
            for (var index = 0; index < shape.length; index++) {
                var cells = highlightLayer.highlightCells[player_id];
                cells[index].x = (shape[index][0] + drop.position.x) * gCellSize
                cells[index].y = (shape[index][1] + drop.position.y) * gCellSize
                cells[index].visible = true
            }
        }
    }
    return highlightLayer;
}

function TrigonHighlightLayerFactory(colorTheme, player_num, mobile_version, piecesCellList) {

    var highlightLayer = new PIXI.Container();

    function highlightCellGenerate(color, index) {
        var graphics = new PIXI.Graphics();

        var smallCellSize = gCellSize - colorTheme.piece.dividing_line_width[mobile_version] * 1;
        var lp = Point(smallCellSize / 2, smallCellSize / 2 * Math.sqrt(3))
        var rp = Point(smallCellSize, 0);
        if (index == 0) var tip = Point(0, 0);
        else tip = Point(smallCellSize * 3 / 2, smallCellSize / 2 * Math.sqrt(3))

        function fillSubTrigon(st, a, b){
            var ma = middle(st, a);
            var mb = middle(st, b);
            graphics.drawPolygon(new PIXI.Polygon([ma, mb, st]));
            graphics.moveTo(ma.x, ma.y);
            graphics.lineTo(mb.x, mb.y);
        }

        graphics.beginFill(color, 1);
        fillSubTrigon(tip, lp, rp);
        fillSubTrigon(lp, rp, tip);
        fillSubTrigon(rp, tip, lp);
        graphics.endFill();

        /*
        graphics.lineColor = colorTheme.piece.dividing_line;
        graphics.lineWidth = colorTheme.piece.dividing_line_width[mobile_version];
        graphics.moveTo(tip.x, tip.y);
        graphics.lineTo(lp.x, lp.y);
        graphics.lineTo(rp.x, rp.y);
        graphics.lineTo(tip.x, tip.y);
        */

        var highlightCell = new PIXI.Sprite(graphics.generateTexture());
        highlightCell.visible = false
        return highlightCell
    }

    var max_size = 0
    piecesCellList.forEach(function (cellLists) {
        cellLists.forEach(function (cellList) {
            max_size = Math.max(max_size, cellList.length)
        })
    })
    highlightLayer.highlightCells = []
    for (var player_id = 0; player_id < player_num; player_id++) {
        cells = [[], []]
        for (var index = 0; index < 2; index ++){
            for (var i = 0; i < max_size; i++) {
                var highlightCell = highlightCellGenerate(
                    colorTheme.piece.last_drop[player_id],
                    index
                )
                cells[index].push(highlightCell)
                highlightLayer.addChild(highlightCell)
            }
        }
        highlightLayer.highlightCells.push(cells)
    }

    highlightLayer.updateHighlight = function (history, length) {
        this.highlightCells.forEach(function (highlightCell) {
            highlightCell.forEach(function (cellList) {
                cellList.forEach(function(cell){
                    cell.visible = false;
                })
            })
        })
        last_drop = [-1, -1, -1, -1];
        for (var index = 0; index < length; index++) {
            drop = history[index]
            last_drop[drop.player_id] = drop
        }
        for (var player_id = 0; player_id < player_num; player_id++) {
            if (last_drop[player_id] === -1)
                continue
            var drop = last_drop[player_id]
            shape = piecesCellList[drop.piece_id][drop.position.state]
            for (var index = 0; index < shape.length; index++) {
                var curShape = shape[index]
                var cell = highlightLayer.highlightCells[player_id][curShape[2]][index];

                var lPos = liftPoint(curShape[0] + drop.position.x, curShape[1] + drop.position.y);
                cell.x = lPos.x + curShape[2] * gCellSize / 2 + colorTheme.piece.dividing_line_width[mobile_version];
                cell.y = lPos.y + colorTheme.piece.dividing_line_width[mobile_version];
                cell.visible = true;
            }
        }
    }
    return highlightLayer;
}

function SquareBoardShapeFactory(colorTheme, boardData, mobile_version){
    var graphics = new PIXI.Graphics();

    graphics.lineColor = colorTheme.board.dividing_line
    graphics.lineWidth = colorTheme.board.dividing_line_width[mobile_version]
    //Draw board line
    for (var i = 0; i <= boardData.board_size; i++) {
        graphics.moveTo(i * gCellSize, 0);
        graphics.lineTo(i * gCellSize, boardData.board_size * gCellSize);
        graphics.moveTo(0, i * gCellSize);
        graphics.lineTo(gCellSize * boardData.board_size, i * gCellSize);
    }

    function draw_initial_posiiton(position, color) {
        graphics.beginFill(color, 1)
        graphics.lineWidth = 0
        graphics.drawRect(
            position[0] * gCellSize + gCellSize / 4,
            position[1] * gCellSize + gCellSize / 4,
            gCellSize / 2, gCellSize / 2
        )
    }
    //Draw initial place
    for (var player_id = 0; player_id < boardData.player_num; player_id++) {
        draw_initial_posiiton(boardData.start_point[player_id], colorTheme.piece.initial[player_id])
    }

    var boardShape = new PIXI.Sprite(graphics.generateTexture());
    return boardShape;
}

function TrigonBoardShapeFactory(colorTheme, boardData, mobile_version){
    var graphics = new PIXI.Graphics();

    graphics.lineColor = colorTheme.board.dividing_line
    graphics.lineWidth = colorTheme.board.dividing_line_width[mobile_version]
    //Draw board line
    var unitX = Point(gCellSize, gCellSize / 2);
    var unitY = Point(0, gCellSize / 2 * Math.sqrt(3));
    function drawLine(start, end){
        var lstart = liftPoint(start.x, start.y), lend = liftPoint(end.x, end.y)
        graphics.moveTo(lstart.x, lstart.y);
        graphics.lineTo(lend.x, lend.y);
    }

    var length = boardData.board_size;
    for (var i = 0; i < length; i ++){
        drawLine(Point(i, length * 2), Point(length * 2, i))
        drawLine(Point(length - i, i), Point(length * 2, i))
        drawLine(Point(i, length * 2), Point(i , length - i))
    }
    for (var i = 0; i < length; i ++){
        drawLine(Point(i + length, 0), Point(0, i + length));
        drawLine(Point(i + length, 0), Point(i + length, length * 2 - i));
        drawLine(Point(length * 2 - i, i + length), Point(0, i + length));
    }
    drawLine(Point(0, length  * 2), Point(length, length * 2));
    drawLine(Point(length  * 2, 0), Point(length * 2, length));
    drawLine(Point(length, length * 2), Point(length * 2, length));

    //Draw initial place
    function draw_initial_posiiton(position, color) {
        graphics.beginFill(color, 1)
        graphics.lineWidth = 0
        var tip = liftPoint(position[0] + position[2], position[1] + position[2])
        var pointL = liftPoint(position[0] + 1, position[1]);
        var pointR = liftPoint(position[0], position[1] + 1);
        var center = Point((tip.x + pointL.x + pointR.x) / 3, (tip.y + pointL.y + pointR.y) / 3);
        graphics.drawPolygon(new PIXI.Polygon([
            middle(tip, center),
            middle(pointL, center),
            middle(pointR, center)
        ]))
    }
    for (var player_id = 0; player_id < boardData.player_num; player_id++) {
        draw_initial_posiiton(boardData.start_point[player_id], colorTheme.piece.initial[player_id])
    }

    var boardShape = new PIXI.Sprite(graphics.generateTexture());
    return boardShape;
}


function BoardFactory(app, mPlayerId, colorTheme, TryDropPiece, boardData, mobile_version) {
    var backgroundGroup = new PIXI.display.Group(-3, false);
    var placedGroup = new PIXI.display.Group(-2, false);
    var highlightGroup = new PIXI.display.Group(-1, false);
    var boardGroup = new PIXI.display.Group(0, false);
    var shadowGroup = new PIXI.display.Group(1, false);
    var pieceGroup = new PIXI.display.Group(2, false);
    var controllerGroup = new PIXI.display.Group(3, false);
    var draggedGroup = new PIXI.display.Group(4, false);
    [
        backgroundGroup,
        placedGroup,
        highlightGroup,
        boardGroup,
        shadowGroup,
        pieceGroup,
        controllerGroup,
        draggedGroup
    ].
    forEach(function (value, index, array) {
        app.stage.addChild(new PIXI.display.Layer(value));
    });

    var boardShapeFactory = {
        "square_standard": SquareBoardShapeFactory,
        "square_duo": SquareBoardShapeFactory,
        "trigon_trio": TrigonBoardShapeFactory
    }
    var boardShape = boardShapeFactory[boardData.board_type](colorTheme, boardData, mobile_version);
    boardShape.parentGroup = boardGroup;

    var board = new PIXI.Container();
    if (boardData.board_type.split("_")[0] === 'square'){
        if (mobile_version) board.x = board.y = 2 * gCellSize;
        else board.x = board.y = 3 * gCellSize;
    }
    else {
        board.x = gCellSize * 2
        board.y = gCellSize * Math.sqrt(3);
    }

    board.addChild(boardShape);

    current_piece_id = -1

    function TouchStartCallBack(piece) {
        board.pieceController.attach(piece)
    }
    function DragStartCallBack(piece, position) {
        current_piece_id = piece.piece_id;
    }
    function DragMoveCallBack(piece, position) {
        board.pieceController.follow()
    }
    function DragEndCallBack(piece, position) {
        data = {
            player_id: mPlayerId,
            piece_id: piece.piece_id,
            position: position
        }
        TryDropPiece(data)
    }

    board.progressBars = []
    for (var player_id = 0; player_id < boardData.player_num; player_id++) {
        if (boardData.board_type.split("_") == "square"){
            var update = function(point){
                return Point(point[0] * gCellSize, point[1] * gCellSize);
            }
        }
        else{
            var update = function(point){
                return liftPoint(point[0], point[1]);
            }
        }
        progressBar = ProgressBarFactory(
            update(boardData.progress_bar_end_point[player_id * 2]),
            update(boardData.progress_bar_end_point[player_id * 2 + 1]),
            player_id,
            colorTheme,
            mobile_version
        )
        progressBar.parentGroup = boardGroup
        board.addChild(progressBar)
        progressBar.setProgressRate(1);
        board.progressBars.push(progressBar);
    }

    function generateBackground() {
        var graphics = new PIXI.Graphics()
        graphics.beginFill(colorTheme.backgroundColor, 1)
        graphics.drawShape(app.screen)
        var background = new PIXI.Sprite(graphics.generateTexture())
        background.x = -gCellSize * 2
        background.y = -gCellSize * 2
        background.parentGroup = backgroundGroup
        return background
    }
    board.addChild(generateBackground())
    board.interactive = true
    board.on("pointerdown", function (event) {
        board.pieceController.detach()
    })

    board.pieceController = PieceControllerFactory(colorTheme, controllerGroup)
    board.addChild(board.pieceController)

    //Create piece
    var pieceLists = [];
    var pieceType = boardData.board_type.split("_")[0];
    for (var playerId = 0; playerId < boardData.player_num; playerId++) {
        var pieceList = [];
        for (var pieceId = 0; pieceId < boardData.piece_shape.length; pieceId++) {
            var piece = PieceFactory(
                pieceId,
                boardData.piece_shape[pieceId],
                new PIXI.Point(board.x, board.y),
                playerId,
                colorTheme,
                mobile_version,
                pieceType,
                pieceGroup,
                shadowGroup,
                draggedGroup,
                TouchStartCallBack,
                DragStartCallBack,
                DragMoveCallBack,
                DragEndCallBack
            );
            piece.SetState(boardData.init_state[mobile_version][pieceId])
            piece.SetPosition(Point.from(boardData.init_locate[mobile_version][pieceId]))
            if (playerId !== mPlayerId)
                piece.SetOwnership(false)
            pieceList.push(piece);
            board.addChild(piece);
        }
        pieceLists.push(pieceList);
    }
    board.pieceLists = pieceLists;
    //Create piece Done

    var HighlightLayerFactory = pieceType === 'square' ? SquareHighlightLayerFactory : TrigonHighlightLayerFactory;
    board.highlightLayer = HighlightLayerFactory(colorTheme, boardData.player_num, mobile_version, boardData.piece_shape);
    board.highlightLayer.parentGroup = highlightGroup
    board.addChild(board.highlightLayer)

    board.loadState = function (state, position) {
        //update progressBar
        for (var playerId = 0; playerId < boardData.player_num; playerId++) {
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
        for (var playerId = 0; playerId < boardData.player_num; playerId++) {
            for (var pieceId = 0; pieceId < boardData.piece_shape.length; pieceId++) {
                _pieceLists[playerId][pieceId].PickUp(playerId === mPlayerId)
            }
        }
        var length = state.board_info.history.length
        if (position !== -1)
            length = Math.min(length, position)
        for (var index = 0; index < length; index++) {
            var piece = state.board_info.history[index]

            var isCurrentPlayer = piece.player_id == mPlayerId;
            var currentPiece = _pieceLists[piece.player_id][piece.piece_id];

            board.pieceController.detach(currentPiece)
            currentPiece.DropDown();
            currentPiece.SetState(piece.position.state);
            currentPiece.SetPosition(piece.position)

            currentPiece.parentGroup = placedGroup;
        }

        board.highlightLayer.updateHighlight(state.board_info.history, length)
    };
    board.update_player = function (playerId) {
        mPlayerId = playerId
        for (var player_id = 0; player_id < boardData.player_num; player_id++) {
            board.pieceLists[player_id].forEach(piece => {
                piece.SetOwnership(player_id === mPlayerId)
            })
        }
    };

    board.isPossiblePosition = function (pieceId, position) {
        if (pieceId > 20 || pieceId < 0)
            return false;
        var positionState = this.position;
    };

    board.detach = function () {
        current_piece_id = -1
    };

    window.addEventListener(
        "keydown",
        function (event) {
            if (current_piece_id === -1)
                return
            if (event.keyCode === 87 || event.keyCode === 83)
                board.pieceLists[mPlayerId][current_piece_id].Flip();
            if (event.keyCode === 65 || event.keyCode === 68)
                board.pieceLists[mPlayerId][current_piece_id].Rotate(event.keyCode === 65);
        },
        false
    );

    return board;
}

function generateBoard(canvas, mPlayerId, boardData, colorTheme, mobile_version) {
    gWidth = canvas.width;
    gHeight = canvas.height;

    var app = new PIXI.Application(
        gWidth,
        gHeight, {
            backgroundColor: colorTheme.backgroundColor,
            view: canvas
        }
    );
    app.stage = new PIXI.display.Stage();

    var trigon_height = Math.sqrt(3) / 2;
    var bound = {
        "square_standard": [
            [30, 29],
            [24, 33]
        ],
        "square_duo": [
            [23, 23],
            [18, 29]
        ],
        "trigon_trio": [
            [15, 15 / trigon_height],
            [15, 15 / trigon_height]
        ]
    }

    var current_bound = bound[boardData.board_type][mobile_version ? 1 : 0];
    gCellSize = Math.floor(Math.min(gWidth / current_bound[0], gHeight / current_bound[1]));
    gOffsetX = boardData.board_size * gCellSize / 2;

    function TryDropPiece(data) {

        $.ajax({
            method: "POST",
            url: "/api/battles/" + battle_interface.battle_data.battle_id,
            data: JSON.stringify(data),
            contentType: 'application/json; charset=UTF-8',
            success: function (data) {
                if (data.message == "success") {
                    battle_interface.battle_data = data.result
                } else {
                    show_message(data.message)
                }
            },
            error: function (data) {
                show_message("请求失败，请检查网络连接")
            }
        })
    }

    var board = BoardFactory(app, mPlayerId, colorTheme, TryDropPiece, boardData, mobile_version ? 1 : 0)
    app.stage.addChild(board);

    //test only
    //board.update_player(0)
    return board;
}