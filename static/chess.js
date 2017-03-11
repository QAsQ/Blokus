/**
 * Created by QAQ on 2017/3/10.
 */
var chessShape, chessState,chessLocate, isHide;
var initp = 0.5, highp = 0.8;
function initChess() {
    for (var index in chessShape) {
        $("#chs_" + index).attr({
            "width": cellSize * 5,
            "height": cellSize * 5,
        });
    }
}

function createChess() {
    chessShape = new Array;
    chessState = new Array;
    chessLocate = new Array;
    for (var index in sCS) {
        chessState[index] = 0;
        chessShape[index] = new Array;
        for (var ind in sCS[index]) {
            chessShape[index] = chessShape[index].concat(xy(sCS[index][ind].x, sCS[index][ind].y));
        }
    }
    for (var index in chessShape) {
        isHide[index] = false;
        var chess = $("<canvas id = \"chs_" + index + "\"></canvas>");
        $("#playGround").append(chess);
        chess.attr({
            "width": cellSize * 5,
            "height": cellSize * 5,
            "name": "chess"
        });
        chessLocate[index] = xy(cellSize * (Math.floor(index / 6) * 5 + 25),cellSize * (5 * (index % 6)));
        chess.css({
            position:"absolute",
            top: chessLocate[index].y + "px",
            left:chessLocate[index].x + "px",
            "z-index":"2",
            opacity:initp
        });
        //todo
    }
}
function refreshChess(index) {
    if (index === undefined) {
        for (var i in chessShape) {
            refreshChess(i);
        }
        return;
    }
    var e = getE("chs_" + index);
    e.clearRect(0, 0, cellSize * 5, cellSize * 5);
    for (var ind in chessShape[index]) {
        drawCell(chessShape[index][ind], colorTheme.player(owner), e);
    }
}
function moveChessTo(x, y, ind) {
    x = Math.min(x, window.innerWidth - cellSize * 5);
    y = Math.min(y, window.innerHeight - cellSize * 5);
    x = Math.max(x,0);
    y = Math.max(y,0);
    chessLocate[ind] = xy(x,y);
    $("#chs_"+ind).css({left:x,top:y});
}
function scaleChess() {
    for(var i in chessLocate){
        var poi = chessLocate[i];
        moveChessTo(poi.x * ratiox,poi.y * ratioy,i);
    }
}
function rotateChessShape(chsShape,x,clock) {
    chsShape = chsShape.map(function (cell) {
        if (clock) cell.x = 4 - cell.x;
        else      cell.y = 4 - cell.y;
        var tx = cell.x;
        cell.x = cell.y;
        cell.y = tx;
    });
    x += ((x % 2) ^ clock) ? 2 : 6;
    return x % 8;
}
function flipChessShape(chsShape,x) {
    chsShape = chsShape.map(function (cell) {
        cell.y = 4 - cell.y;
    });
    return x ^ 1;
}

var sCS = [
    [xy(0, 0)],//1

    [xy(0, 0), xy(0, 1)],//2
    [xy(0, 0), xy(0, 1), xy(1, 0)],//2+1
    [xy(0, 0), xy(0, 1), xy(0, 2)],//3
    [xy(0, 0), xy(0, 1), xy(1, 0), xy(1, 1)],//[]
    [xy(0, 0), xy(0, 1), xy(0, 2), xy(1, 1)],//t

    [xy(0, 0), xy(0, 1), xy(0, 2), xy(0, 3)],//4
    [xy(0, 0), xy(0, 1), xy(0, 2), xy(1, 0)],//3+1
    [xy(0, 0), xy(0, 1), xy(1, 1), xy(1, 2)],//z
    [xy(0, 0), xy(0, 1), xy(0, 2), xy(0, 3), xy(1, 0)],//4+1
    [xy(0, 0), xy(0, 1), xy(0, 2), xy(1, 1), xy(2, 1)],//T

    [xy(0, 0), xy(0, 1), xy(0, 2), xy(1, 0), xy(2, 0)],//L
    [xy(0, 0), xy(0, 1), xy(0, 2), xy(1, 2), xy(1, 3)],//2+3
    [xy(0, 0), xy(1, 0), xy(1, 1), xy(1, 2), xy(2, 2)],//3+1+1
    [xy(0, 0), xy(0, 1), xy(0, 2), xy(0, 3), xy(0, 4)],//5
    [xy(0, 0), xy(0, 1), xy(0, 2), xy(1, 0), xy(1, 1)],//3*2

    [xy(0, 0), xy(0, 1), xy(1, 1), xy(1, 2), xy(2, 2)],//2+2+1
    [xy(0, 0), xy(0, 1), xy(0, 2), xy(1, 0), xy(1, 2)],//6-1
    [xy(0, 0), xy(0, 1), xy(1, 1), xy(1, 2), xy(2, 1)],//1+3+1
    [xy(1, 0), xy(1, 1), xy(1, 2), xy(0, 1), xy(2, 1)],//10
    [xy(0, 0), xy(0, 1), xy(0, 2), xy(0, 3), xy(1, 1)]//4+1

];
