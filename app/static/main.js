/**
 * Created by QAQ on 2017/12/6.
 */

var app = new PIXI.Application(1280, 1920, { backgroundColor: 0xFFFFFF});
document.body.appendChild(app.view);

gCellSize = 20;
gBoardSize = gCellSize * 20;
//gPlayerId = 1;

var board = BoardFactory(ColorThemeFactory("default"));
app.stage.addChild(board);

$(function () {
    window.setInterval(function () {
        $.get("/v1/battle/1/player/"+gPlayerId, {}, function(state){
            board.loadState(state);
        });
    }, 1000);
});

