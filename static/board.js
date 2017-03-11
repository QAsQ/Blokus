/**
 * Created by QAQ on 2017/3/3.
 */

var boardFace;
var colorTheme;
var cornerState,ncor = 0.3;
function createCorner() {
    cornerState = new Array;
    for(var i = 0 ; i < 4 ; i ++){
        var corner = $("<canvas id = \"corn_" + i + "\"></canvas>");
        cornerState[i] = -1;
        $("#playGround").append(corner);
        corner.css("opacity",ncor);
    }
}
function initCorner() {
    var locate = [xy(4,4),xy(4,25),xy(25,25),xy(25,4)];
    for(var i = 0 ; i < 4 ; i ++) {
        $("#corn_" + i).attr({
            "width": cellSize,
            "heitht": cellSize,
        }).css({
            left:locate[i].x * cellSize +"px",
            top:locate[i].y * cellSize +"px",
            position:"absolute",
            "z-index":"2",
        });
        drawCell(xy(0,0),colorTheme.corner(cornerState[i]),getE("corn_"+i));
        //todo triangle
    }
    if(round !== -1) $("#corn_"+(round%4)).css("opacity",1);
}
function nextRound() {
    if(round !== -1) $("#corn_"+(round%4)).css("opacity",ncor);
    round++;
    $("#corn_"+(round%4)).css("opacity",1);
}

	    //{o:owner,sta:chessState[highlight],x:pox,y:poy,id:highlight}
function changeStaTo(_sta, chs) {
    var sta = 0;
    if (_sta & 1) sta = flipChessShape(chs, sta);
    while (sta !== _sta) {
        sta = rotateChessShape(chs, sta, true);
    }
}
function AddChess(Sta) {
    var chs = new Array;
    for(var i in sCS[Sta.id]){
        chs = chs.concat(oxy(Sta.o,sCS[Sta.id][i].x,sCS[Sta.id][i].y));
    }
    changeStaTo(Sta.sta, chs);

    chs = chs.map(upd(Sta.x,Sta.y));

    boardFace = boardFace.concat(chs);
    refreshBoard();
}
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
    var dxy = cellSize * 5;
    $("#board").attr({
        "width": boardSize,
        "height": boardSize,
    }).css({
        position:"absolute",
        top:dxy + "px",
        left:dxy + "px",
        "z-index":"0",
        opacity: 1
    });
    $("#mask").attr({
        "width": boardSize,
        "height": boardSize,
    }).css({
        position:"absolute",
        top:dxy + "px",
        left:dxy + "px",
        "z-index":"1",
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

function inBoard(arrs,ofx,ofy) {
    var cells = arrs.map(function (cell) {
        return oxy(owner, ofx + cell.x, ofy + cell.y);
    });
    //cell outRange
    if (indexof(cells.map(inbod), false).length !== 0) return "outofrange";
    var owners = boardFace.filter(function (cell) {
        return cell.o === owner;
    });
    var edgeCrash = owners.map(upd(1, 0))
        .concat(owners.map(upd(0, 1)))
        .concat(owners.map(upd(-1, 0)))
        .concat(owners.map(upd(0, -1)));
    var crash = indexof(cells.map(inThe(boardFace.concat(edgeCrash))), true);
    var touch = indexof(cells.map(inThe(availableCell())), true).length;
    if (crash.length !== 0 || touch === 0) return "unlegal";
    return "legal";
}

function inMask(ind, ofx, ofy) {
    e = getE("mask");
    e.clearRect(0, 0, boardSize, boardSize);
    var status = inBoard(chessShape[ind],ofx,ofy);
    if(status === "outofrange"){
        e.strokeStyle = colorTheme.rim;
        e.lineWidth = 5;
        e.beginPath();
        e.moveTo(0, 0);
        e.lineTo(boardSize, 0), e.lineTo(boardSize, boardSize);
        e.lineTo(0, boardSize), e.lineTo(0, 0);
        e.stroke();
    }
    var color;
    if(status === "unlegal")
        color = colorTheme.unlegal;
    if(status === "legal")
        color = colorTheme.legal;
    var cells = chessShape[ind].map(function (cell) {
        return oxy(owner, ofx + cell.x, ofy + cell.y);
    });
    for (var index in cells) {
        drawCell(cells[index], color, e);
    }
}

function availableRound() {
    var bst = new Array;
    for(var i = 0 ; i < 20 ; i ++){
        bst[i] = new Array;
        for(var j = 0 ; j < 20 ; j ++){
            bst[i][j] = 0;
        }
    }
    var owners = boardFace.filter(function (cell) {
        return cell.o === owner;
    });
    var horn = owners.map(upd(1, 1)).concat(owners.map(upd(-1, 1))).concat(owners.map(upd(1, -1))).concat(owners.map(upd(-1, -1))).filter(inbod);
    var crash = owners.map(upd(0, 1)).concat(owners.map(upd(1, 0))).concat(owners.map(upd(0, -1))).concat(owners.map(upd(-1, 0)));
    crash = crash.concat(boardFace).filter(inbod);
    for(var ind in horn){
        bst[horn[ind].x][horn[ind].y] = 1;
    }
    for(var ind in crash){
        bst[crash[ind].x][crash[ind].y] = -1;
    }

    for(var ind in sCS){
        if(isHide[ind] === true) continue;
        var chs = chessShape[ind].map(function (cells) {
            return xy(cells.x, cells.y);
        });
        for(var sta = 0 ; sta < 8 ; sta ++){
            if(sta === 4) flipChessShape(chs,0);
            rotateChessShape(chs,0,true);
            for(var x = -4 ; x < 20 ; x ++){
                for(var y = -4 ; y < 20 ; y ++){
                    if(cheavi(chs,bst,x,y) === true) return true;
                }
            }
        }
    }
    return false;
}
function cheavi(arrs,bst,x,y) {
    var ret = 0;
    for(var i in arrs){
        if(!inbod(xy(arrs[i].x+x,arrs[i].y+y))) return false;
        if(bst[arrs[i].x + x][arrs[i].y + y] === -1) return false;
        ret += bst[arrs[i].x + x][arrs[i].y + y];
    }
    return ret > 0;
}
