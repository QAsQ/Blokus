/**
 * Created by QAQ on 2017/3/11.
 */
var boardFace;
var initp = 0.3, highp = 0.8
var colorTheme;
var socket;
var round;
var ratiox,ratioy,bw,bh;

function initSize() {
    var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    if(bw !== undefined)
        ratiox = w / bw;
    if(bh !== undefined)
        ratioy = h / bh;
    bw = w,bh = h;
    cellSize = Math.floor(Math.min(w,h)/ 30);
    boardSize = cellSize * 20;
}
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
function init(x) {
    owner = x;
    round = 0;
    initColorTheme();
    clearFace();
    initSize();
    initBoard();
    initChess();
    createChess();
    refreshBoard();
    refreshChess();
    initAction();
    initSocket();
    $(window).resize(function () {
        initSize();
        scaleChess();
        initBoard();
        initChess();
        refreshBoard();
        refreshChess();
    })
}
function initAction() {
    function getID(cx, cy) {
        for (var i in chessLocate) {
            if (isHide[i]) continue;
            var offx = chessLocate[i].x;
            var offy = chessLocate[i].y;
            for (var j in chessShape[i]) {
                var poi = chessShape[i][j];
                if (inreg(0, cellSize, cx - offx - cellSize * poi.x)
                    && inreg(0, cellSize, cy - offy - cellSize * poi.y))
                    return i;
            }
        }
        return -1;
    }

    var mouseDown = false;
    var select = -1;
    var clix, cliy // mouselocetion
        , chsx, chsy //chesslocation
        , pox, poy //mouse index in board
        , centx,centy;//select chess center
    function updHighlight(x) {
        if (select != -1) $("#chs_" + select).css("opacity", initp);
        console.log(x);
        select = x;
        if (select != -1) $("#chs_" + select).css("opacity", highp);
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
        chsx = $("#chs_" + select).position().left;
        chsy = $("#chs_" + select).position().top;
        pox = Math.floor(0.5 + (chsx - $("#board").position().left) / cellSize);
        poy = Math.floor(0.5 + (chsy - $("#board").position().top ) / cellSize);
    }
    function moveChess(e) {
        if (select === -1) return;
        chsx -= clix - e.clientX, chsy -= cliy - e.clientY;
        moveChessTo(chsx,chsy,select);
    }
    function flipChess() {
        getCent();
        chsy = centy * 2 - cellSize * 5 - chsy;
        moveChessTo(chsx,chsy,select);

        chessState[select] = flipChessShape(chessShape[select],chessState[select]);
        refreshChess(select);
        getPo();
        tryInBoard(select, pox, poy);
    }
    function rotateChess(ind, clix, cliy, clock) {
        getCent();
        var dx = centx - chsx, dy = centy - chsy;
        if(clock) chsx = centx - dy, chsy =  centy - (5 * cellSize - dx);
        else      chsx = centx - (5 * cellSize - dy), chsy =  centy - dx;
        moveChessTo(chsx,chsy,select);

        chessState[select] = rotateChessShape(chessShape[select],chessState[select],clock);

        refreshChess(select);
        getPo();
        tryInBoard(select, pox, poy);
    }

    $(window).mousedown(function (e) {
        mouseDown = true;
        clix = e.clientX, cliy = e.clientY;
        getE("mask").clearRect(0, 0, boardSize, boardSize);
        updHighlight(getID(clix, cliy));
        if (select !== -1)
            getPo(), tryInBoard(select, pox, poy);
    });
    $(window).mouseup(function (e) {
        if (select != -1 && tryInBoard(select, pox, poy)) {
            if(round % 4 === owner){
                chessIn(select, pox, poy);
                round ++;
            }
            getE("mask").clearRect(0, 0, boardSize, boardSize);
        }
        mouseDown = false;
    });
    $(window).mousemove(function (e) {
        if (mouseDown === true && select !== -1) {
            getPo();
            moveChess(e);
            tryInBoard(select, pox, poy);
        }
        clix = e.clientX, cliy = e.clientY;
    });
    $(window).keydown(function (e) {
        if (select === -1) return;
        switch (e.keyCode) {
            case 87: //w
            case 83: //s
                flipChess(select, clix, cliy);
                break;
            case 65: // a
                rotateChess(select, clix, cliy, true);
                break;
            case 68: //d
                rotateChess(select, clix, cliy, false);
                break;
            default:
                break;
        }
    });
}

function initColorTheme(theme) {
    if (theme === undefined) {
        colorTheme = {
            horn: "#a5a7a5",
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
