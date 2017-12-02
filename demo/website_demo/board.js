var app = new PIXI.Application(1280, 1920, { backgroundColor: 0xFFFFFF});
document.body.appendChild(app.view);

gCellSize = 50;
gBoardSize = gCellSize * 20;
gPlayerid = 1;

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
    board.zOrder = 0;
    //var cellFlat = [];
    //for (var x = 0; x < 20; x++) {
    //    cellFlat.push([]);
    //    for (var y = 0; y < 20; y++) {
    //        var cell = CellFactory(
    //            colorTheme.boardBackgroundColor,
    //            new PIXI.Point(x, y)
    //        );
    //        board.addChild(cell);
    //        cellFlat[x].push(cell);
    //    }
    //}
    //board.cellFlat = cellFlat;

    function log_call_back(id, data) {
        console.log(id);
        console.log(data);
    }

    var cell_list = [
        new PIXI.Point(0, 0),
        new PIXI.Point(0, 1),
        new PIXI.Point(0, 2)
    ];

    var chess1 = PieceFactory(1, cell_list, colorTheme.pieceColor[gPlayerid],
        log_call_back,
        log_call_back,
        log_call_back);

    chess1.zOrder = -1;
    board.addChild(chess1);

    var cell_list2 = [
        new PIXI.Point(0, 0),
        new PIXI.Point(1, 1),
        new PIXI.Point(0, 1)
    ];

    var chess2 = PieceFactory(2, cell_list2,colorTheme.pieceColor[gPlayerid],
        log_call_back,
        log_call_back,
        log_call_back);
    chess2.x = 5 * gCellSize;
    chess2.y = 5 * gCellSize;
    board.addChild(chess2);

    return board;
}

var board = BoardFactory(ColorThemeFactory("default"));
app.stage.addChild(board);


