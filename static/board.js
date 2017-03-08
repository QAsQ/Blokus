/**
 * Created by QAQ on 2017/3/3.
 */
function init(x) {
    owner = x;
    round = 0;
    isHide = new Array;
    initColorTheme();
    clearFace();
    initSize();
    createChess();
    refreshBoard();
    refreshChess();
    initAction();
    initSocket();
    $(window).resize(function () {
        initSize();
        refreshBoard();
        refreshChess();
    })
}
var dx = 150, dy = 150;
var boardFace;
var initp = 0.3, highp = 0.8
var isHide;
var chessShape, chessState;
var colorTheme;
var socket;
var round;


function initSocket(){
    socket = io.connect('http://' + document.domain + ':' + location.port);
    socket.on('connect',function() {
        socket.emit('on',{o:owner});
    });
    socket.on('battle',function(Sta){
	if(Sta.o != owner){
	    round ++;
	    AddChess(Sta);
	}
    });
}

	    //{o:owner,sta:chessState[highlight],x:pox,y:poy,id:highlight}
function AddChess(Sta) {
    var chs = new Array;
    for(var i in sCS[Sta.id]){
        chs = chs.concat(con(Sta.o,sCS[Sta.id][i].x,sCS[Sta.id][i].y));
    }
    var sta = 0;
    if(Sta.sta & 1) sta = flipChessShape(chs,sta);
    while(sta !== Sta.sta){
        sta = rotateChessShape(chs,sta,true);
    }

    chs = chs.map(upd(Sta.x,Sta.y));

    boardFace = boardFace.concat(chs);
    refreshBoard();
}
function chessIn(ind, ofx, ofy) {
    var cells = chessShape[ind].map(function (cell) {
        return con(owner, ofx + cell.x, ofy + cell.y);
    });
    socket.emit('battle',{o:owner,sta:chessState[ind],x:ofx,y:ofy,id:ind});
    $("#chs_" + ind).hide();
    boardFace = boardFace.concat(cells);
    refreshBoard();
}
function getE(name) {
    return document.getElementById(name).getContext("2d");
}
function initSize() {
    var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    boardSize = Math.min(w, h);
    cellSize = Math.floor((boardSize - dx * 2) / 20);
    boardSize = cellSize * 20;
    $("#board").attr({
        "width": boardSize,
        "height": boardSize,
        "style": "position:absolute;top:" + dx + "px;left:" + dy + "px;z-index:0;opacity:1"
    });
    $("#mask").attr({
        "width": boardSize,
        "height": boardSize,
        "style": "position:absolute;top:" + dx + "px;left:" + dy + "px;z-index:1;opacity:0.7"
    });
    for (var index in chessShape) {
        $("#chs_" + index).attr({
            "width": cellSize * 5,
            "height": cellSize * 5,
        });
    }
}
var sCS = [
    [cpoi(0, 0)],//1

    [cpoi(0, 0), cpoi(0, 1)],//2
    [cpoi(0, 0), cpoi(0, 1), cpoi(1, 0)],//2+1
    [cpoi(0, 0), cpoi(0, 1), cpoi(0, 2)],//3
    [cpoi(0, 0), cpoi(0, 1), cpoi(1, 0), cpoi(1, 1)],//[]
    [cpoi(0, 0), cpoi(0, 1), cpoi(0, 2), cpoi(1, 1)],//t

    [cpoi(0, 0), cpoi(0, 1), cpoi(0, 2), cpoi(0, 3)],//4
    [cpoi(0, 0), cpoi(0, 1), cpoi(0, 2), cpoi(1, 0)],//3+1
    [cpoi(0, 0), cpoi(0, 1), cpoi(1, 1), cpoi(1, 2)],//z
    [cpoi(0, 0), cpoi(0, 1), cpoi(0, 2), cpoi(0, 3), cpoi(1, 0)],//4+1
    [cpoi(0, 0), cpoi(0, 1), cpoi(0, 2), cpoi(1, 1), cpoi(2, 1)],//T

    [cpoi(0, 0), cpoi(0, 1), cpoi(0, 2), cpoi(1, 0), cpoi(2, 0)],//L
    [cpoi(0, 0), cpoi(0, 1), cpoi(0, 2), cpoi(1, 2), cpoi(1, 3)],//2+3
    [cpoi(0, 0), cpoi(1, 0), cpoi(1, 1), cpoi(1, 2), cpoi(2, 2)],//3+1+1
    [cpoi(0, 0), cpoi(0, 1), cpoi(0, 2), cpoi(0, 3), cpoi(0, 4)],//5
    [cpoi(0, 0), cpoi(0, 1), cpoi(0, 2), cpoi(1, 0), cpoi(1, 1)],//3*2

    [cpoi(0, 0), cpoi(0, 1), cpoi(1, 1), cpoi(1, 2), cpoi(2, 2)],//2+2+1
    [cpoi(0, 0), cpoi(0, 1), cpoi(0, 2), cpoi(1, 0), cpoi(1, 2)],//6-1
    [cpoi(0, 0), cpoi(0, 1), cpoi(1, 1), cpoi(1, 2), cpoi(2, 1)],//1+3+1
    [cpoi(1, 0), cpoi(1, 1), cpoi(1, 2), cpoi(0, 1), cpoi(2, 1)],//10
    [cpoi(0, 0), cpoi(0, 1), cpoi(0, 2), cpoi(0, 3), cpoi(1, 1)]//4+1
];
function inreg(l, r, v) {
    return l <= v && v <= r;
}
function inbod(pane) {
    return inreg(0, 19, pane.x) && inreg(0, 19, pane.y);
}
function createChess() {
    chessShape = new Array;
    chessState = new Array;
    for (var index in sCS) {
        chessState[index] = 0;
        chessShape[index] = new Array;
        for (var ind in sCS[index]) {
            chessShape[index] = chessShape[index].concat(cpoi(sCS[index][ind].x, sCS[index][ind].y));
        }
    }
    for (var index in chessShape) {
        isHide[index] = false;
        var chess = $("<canvas id = \"chs_" + index + "\"></canvas>");
        $("#playGround").append(chess);
        chess.attr({
            "width": cellSize * 5,
            "height": cellSize * 5,
            "style": "position:absolute;top:" + (dx * (index % 5)) + "px;left:" + (dy * Math.floor(index / 5) + boardSize) + "px;z-index:2;opacity:" + initp,
            "name": "chess"
        });
        //todo
    }
}
function initColorTheme(theme) {
    if (theme === undefined) {
        colorTheme = {
            horn: "#e8ddc1",
            legal: "#6f645e",
            rim: "#875f5f",
            unlegal: "#c3bba8",
            can: "#f9f9f9",
            player: function (o) {
                switch (o) {
                    case 0: return "#b53d1b";
                    case 1: return "#7cb661";
                    case 2: return "#83c6d3";
                    case 3: return "#e2dd5a";
                }
                return undefined;
            }
        }
    }
    else {
        colorTheme = theme;
    }
}
function clearFace() {
    boardFace = new Array;
    boardFace.push(con(0, -1, -1)
        , con(1, -1, 20)
        , con(2, 20, 20)
        , con(3, 20, -1));
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
            var poi = cpoi(i, j);
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
function drawCell(cell, color, e) {
    e.fillStyle = color;
    e.fillRect(cellSize * cell.x, cellSize * cell.y, cellSize, cellSize);
}
function debug(x, y) {
    alert(x + " " + y);
}
function dearr(inp) {
    for (var index in inp) {
        alert("o:" + inp[index].o + " x:" + inp[index].x + " y:" + inp[index].y);
    }
}
function initAction() {
    function getID(cx, cy) {
        for (var index in chessShape) {
            if (isHide[index]) continue;
            var offx = $("#chs_" + index).position().left;
            var offy = $("#chs_" + index).position().top;
            for (var ind in chessShape[index]) {
                var poi = chessShape[index][ind];
                if (inreg(0, cellSize, cx - offx - cellSize * poi.x)
                    && inreg(0, cellSize, cy - offy - cellSize * poi.y)) return index;
            }
        }
        return -1;
    }

    var mouseDown = false;
    var highlight = -1;
    var clix, cliy // mouselocetion
        , chsx, chsy //chesslocation
        , pox, poy //mouse index in board
        ,centx,centy;//highlight chess center
    function updHighlight(x) {
        if (highlight != -1) $("#chs_" + highlight).css("opacity", initp);
        getE("mask").clearRect(0, 0, boardSize, boardSize);
        highlight = x;
        if (highlight != -1) $("#chs_" + highlight).css("opacity", highp);
    }
    function getCent() {
        getPo();
        if (!inreg(0, cellSize * 5, clix - chsx) || !inreg(0, cellSize * 5, cliy - chsy)) {
            centx =chsx + cellSize * 2.5, centy = chsy + cellSize * 2.5;
        }
        else{
            centx = clix, centy = cliy;
        }
    }

    function getPo() {
        chsx = $("#chs_" + highlight).position().left;
        chsy = $("#chs_" + highlight).position().top;
        pox = Math.floor(0.5 + (chsx - $("#board").position().left) / cellSize);
        poy = Math.floor(0.5 + (chsy - $("#board").position().top ) / cellSize);
    }
    function moveChess(e) {
        if (highlight === -1) return;
        chsx -= clix - e.clientX, chsy -= cliy - e.clientY;
        var __ret = moveChessTo(chsx,chsy,highlight);
        chsx = __ret.x;
        chsy = __ret.y;
    }
    function flipChess() {
        getCent();
        chsy = centy * 2 - cellSize * 5 - chsy;
        var __ret = moveChessTo(chsx,chsy,highlight);
        chsx = __ret.x;
        chsy = __ret.y;

        chessState[highlight] = flipChessShape(chessShape[highlight],chessState[highlight]);
        refreshChess(highlight);
        getPo();
        tryInBoard(highlight, pox, poy);
    }
    function rotateChess(ind, clix, cliy, clock) {
        getCent();
        var dx = centx - chsx, dy = centy - chsy;
        if(clock) chsx = centx - dy, chsy =  centy - (5 * cellSize - dx);
        else      chsx = centx - (5 * cellSize - dy), chsy =  centy - dx;
        var __ret = moveChessTo(chsx,chsy,highlight);
        chsx = __ret.x;
        chsy = __ret.y;

        chessState[highlight] = rotateChessShape(chessShape[highlight],chessState[highlight],clock);

        refreshChess(highlight);
        getPo();
        tryInBoard(highlight, pox, poy);
    }

    $(window).mousedown(function (e) {
        mouseDown = true;
        clix = e.clientX, cliy = e.clientY;
        updHighlight(getID(clix, cliy));
        if (highlight !== -1)
            getPo(), tryInBoard(highlight, pox, poy);
    });
    $(window).mouseup(function (e) {
        if (highlight != -1 && tryInBoard(highlight, pox, poy)) {
	    if(round % 4 === owner){
                chessIn(highlight, pox, poy);
                round ++;
	    }
            getE("mask").clearRect(0, 0, boardSize, boardSize);
        }
        mouseDown = false;
    });
    $(window).mousemove(function (e) {
        if (mouseDown === true && highlight !== -1) {
            getPo();
            moveChess(e);
            tryInBoard(highlight, pox, poy);
        }
        clix = e.clientX, cliy = e.clientY;
    });
    $(window).keydown(function (e) {
        if (highlight === -1) return;
        switch (e.keyCode) {
            case 87: //w
            case 83: //s
                flipChess(highlight, clix, cliy);
                break;
            case 65: // a
                rotateChess(highlight, clix, cliy, true);
                break;
            case 68: //d
                rotateChess(highlight, clix, cliy, false);
                break;
            default:
                break;
        }
    });
}
function moveChessTo(chsx, chsy, index) {
    chsx = Math.min(chsx, window.innerWidth - cellSize * 5);
    chsy = Math.min(chsy, window.innerHeight - cellSize * 5);
    chsx = Math.max(chsx,0);
    chsy = Math.max(chsy,0);
    $("#chs_" + index).css({left: chsx, top: chsy});
    return {x: chsx, y: chsy};
}
function flipChessShape(chsShape,x) {
    chsShape = chsShape.map(function (cell) {
        cell.y = 4 - cell.y;
    });
    return x ^ 1;
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
        return con(owner, ofx + cell.x, ofy + cell.y);
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
function inThe(arrs) {
    return function (cell) {
        for (var i in arrs) {
            if (arrs[i].x == cell.x && arrs[i].y == cell.y)
                return true;
        }
        return false;
    }
}
function ninThe(arrs) {
    return function (cell) {
        for (var i in arrs) {
            if (arrs[i].x == cell.x && arrs[i].y == cell.y)
                return false;
        }
        return true;
    }
}
function indexof(arrs, should) {
    var ret = new Array;
    for (var ind in arrs) {
        if (arrs[ind] === should) {
            ret.push(ind);
        }
    }
    return ret;
}
function upd(x, y) {
    return function (cell) {
        return con(cell.o, cell.x + x, cell.y + y);
    }
}
function cpoi(x, y) {
    return {x: x, y: y};
}
function con(o, x, y) {
    return {o: o, x: x, y: y};
}
