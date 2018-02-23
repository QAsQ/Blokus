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
app.stage = new PIXI.display.Stage();
document.body.appendChild(app.view);

gCellSize = Math.floor(Math.min(gWidth, gHeight) / 28)
gBoardSize = gCellSize * 20;

$.get("/boards/normal", {}, function(boardData){
    console.log(boardData)
    function TryDropPiece(data){
        data.player_id = gPlayerId
        $.ajax({
            type: 'POST',
            url:  "/battles/1", 
            data: JSON.stringify(data), 
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json', 
            success: function(state) {
                board.loadState(state);
            }
        });
    }

    var board = BoardFactory(app, ColorThemeFactory("default"), TryDropPiece, boardData)
    app.stage.addChild(board);

    $(function () {
        var data = {
            "player_id": gPlayerId
        }
        window.setInterval(function () {
            $.get("/battles/1", data, function(state){
                board.loadState(state);
            });
        }, 1000);
    });
});
