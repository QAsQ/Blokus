/**
 * Created by QAQ on 2017/12/6.
 */

var app = new PIXI.Application(1280, 1920, { backgroundColor: 0xFFFFFF});
document.body.appendChild(app.view);

gCellSize = 20;
gBoardSize = gCellSize * 20;
gPlayerId = 1;

var board = BoardFactory(ColorThemeFactory("default"));

$.get("/v1/battle/1/1", {}, function(state){
    board.loadState(state);
    app.stage.addChild(board);
});

