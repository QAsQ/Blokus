/**
 * Created by QAQ on 2017/12/6.
 */

gWidth = 800
gHeight = 400

/*
gWidth = 1920
gHeight = 1080
*/

var app = new PIXI.Application(gWidth, gHeight, { backgroundColor: 0xD6DAD9});
document.body.appendChild(app.view);

gCellSize = Math.floor(Math.min(gWidth, gHeight) / 28)
gBoardSize = gCellSize * 20;

board = BoardFactory(app, ColorThemeFactory("default"))
app.stage.addChild(board);

$(function () {
    window.setInterval(function () {
        $.get("/v1/battle/1/player/"+gPlayerId, {}, function(state){
                board.loadState(state);
        });
    }, 1000);
});