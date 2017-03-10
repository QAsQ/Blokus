/**
 * Created by QAQ on 2017/3/3.
 */

	    //{o:owner,sta:chessState[highlight],x:pox,y:poy,id:highlight}
function chessIn(ind, ofx, ofy) {
    var cells = chessShape[ind].map(function (cell) {
        return oxy(owner, ofx + cell.x, ofy + cell.y);
    });
    socket.emit('battle',{o:owner,sta:chessState[ind],x:ofx,y:ofy,id:ind});
    $("#chs_" + ind).hide();
    boardFace = boardFace.concat(cells);
    refreshBoard();
}
function initBoard() {
    $("#board").attr({
        "width": boardSize,
        "height": boardSize,
    });
    var dxy = cellSize * 5;
    $("#board").css({
        position:"absolute",
        top:dxy + "px",
        left:dxy + "px",
        "z-index":"0",
        opacity: 1
    });
    $("#mask").attr({
        "width": boardSize,
        "height": boardSize,
    });
    $("#mask").css({
        position:"absolute",
        top:dxy + "px",
        left:dxy + "px",
        "z-index":"0",
        opacity: 0.7
    });
}
function clearFace() {
    boardFace = new Array;
    boardFace.push(oxy(0, -1, -1)
        , oxy(1, -1, 20)
        , oxy(2, 20, 20)
        , oxy(3, 20, -1));
    isHide = new Array;
}
function drawLine(e) {
    e.lineWidth = 1;
    e.strokeStyle = "rgba(105,105,105,0.5)";
    e.beginPath();
    for (var i = 0; i <= 20; i++) {
        e.moveTo(i * cellSize, 0), e.lineTo(i * cellSize, boardSize);
        e.moveTo(0, i * cellSize), e.lineTo(boardSize, i * cellSize);
    }
    e.closePath();
    e.stroke();
}
function drawAvailable(e) {
    var owners = boardFace.filter(function (cell) {
        return cell.o === owner;
    });
    owners = owners.map(upd(0, 1)).concat(owners.map(upd(1, 0))).concat(owners.map(upd(0, -1))).concat(owners.map(upd(-1, 0)));
    for (var i = 0; i <= 19; i++) {
        for (var j = 0; j <= 19; j++) {
            var poi = xy(i, j);
            if (inThe(owners.concat(boardFace))(poi) === false) {
                drawCell(poi, colorTheme.can, e);
            }
        }
    }
}
function drawHorn(e) {
    var drawable = boardFace.filter(inbod);
    for (var index in drawable) {
        drawCell(drawable[index], colorTheme.player(drawable[index].o), e);
    }
    var horn = availableCell();
    for (var i in horn) {
        drawCell(horn[i], colorTheme.horn, e);
    }
}
function refreshBoard() {
    var e = getE("board");
    e.clearRect(0, 0, boardSize, boardSize);
    drawAvailable(e);
    drawHorn(e);
    drawLine(e);
}
function availableCell() {
    var owners = boardFace.filter(function (cell) {
        return cell.o === owner;
    });
    var ret = new Array, crash = new Array;
    ret = owners.map(upd(1, 1)).concat(owners.map(upd(-1, 1))).concat(owners.map(upd(1, -1))).concat(owners.map(upd(-1, -1)));
    crash = owners.map(upd(0, 1)).concat(owners.map(upd(1, 0))).concat(owners.map(upd(0, -1))).concat(owners.map(upd(-1, 0)));
    crash = crash.concat(boardFace);
    return ret.filter(ninThe(crash)).filter(inbod);
}
function tryInBoard(ind, ofx, ofy) {
    var cells = chessShape[ind].map(function (cell) {
        return oxy(owner, ofx + cell.x, ofy + cell.y);
    });
    e = getE("mask");
    e.clearRect(0, 0, boardSize, boardSize);
    //cell outRange
    if (indexof(cells.map(inbod), false).length !== 0) {
        e.strokeStyle = colorTheme.rim;
        e.lineWidth = 5;
        e.beginPath();
        e.moveTo(0, 0);
        e.lineTo(boardSize, 0), e.lineTo(boardSize, boardSize);
        e.lineTo(0, boardSize), e.lineTo(0, 0);
        e.stroke();
        return false;
    }
    cor = colorTheme.legal;
    var owners = boardFace.filter(function (cell) {
        return cell.o === owner;
    });
    //edge samecolor
    var edgeCrash = owners.map(upd(1, 0))
        .concat(owners.map(upd(0, 1)))
        .concat(owners.map(upd(-1, 0)))
        .concat(owners.map(upd(0, -1)));
    var crash = indexof(cells.map(inThe(boardFace.concat(edgeCrash))), true);

    var touch = indexof(cells.map(inThe(availableCell())), true).length;
    if (crash.length !== 0 || touch === 0) cor = colorTheme.unlegal;
    for (var index in cells) {
        if (crash.indexOf(index) === -1)
            drawCell(cells[index], cor, e);
    }
    return cor === colorTheme.legal;
}
