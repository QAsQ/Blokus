/**
 * Created by QAQ on 2017/12/6.
 */

gWidth = 800 
gHeight = 500

var app = new PIXI.Application(gWidth, gHeight, { backgroundColor: 0xD6DAD9});
document.body.appendChild(app.view);

gCellSize = Math.floor(Math.min(gWidth, gHeight) / 28)
gBoardSize = gCellSize * 20;

board = BoardFactory(ColorThemeFactory("default"))
app.stage.addChild(board);

centerList = [
    {x: gCellSize * 2, y: gCellSize * 2}, 
    {x: gCellSize * 2, y: gCellSize * 26}, 
    {x: gCellSize * 26, y: gCellSize * 26}, 
    {x: gCellSize * 26, y: gCellSize * 2},]

for (var id = 0; id < 4; id++)
{
    progressBar = ProgressBarFactory(
        app,
        centerList[id],
        centerList[(id + 3) % 4],
        3, 
        ColorThemeFactory("default").pieceColor[id.toString()]
    )
    app.stage.addChild(progressBar)
    progressBar.activate();
    progressBar.setProgressRate(0.8);
}

$(function () {
    window.setInterval(function () {
        $.get("/v1/battle/1/player/"+gPlayerId, {}, function(state){
            board.loadState(state);
        });
    }, 1000);
});
