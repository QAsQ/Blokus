/**
 * Created by QAQ on 2017/3/11.
 */
var round;
var ratiox,ratioy,bw,bh;
var bars;
var colorTheme;
var stepTime,fullTime;
var username;


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
function init() {
    owner = -1;
    round = -1;
    stepTime = 5,fullTime = 240;
    curTime = stepTime;
    roundTime = [fullTime,fullTime,fullTime,fullTime];
    initColorTheme();
    initSize();
    clearFace();
    createChess();
    createCorner();
    createProbar();
    initBoard();
    initChess();
    initCorner();
    initProbar();
    refreshBoard();
    refreshChess();
    refreshProbar();
    initAction();
    $(window).resize(function () {
        initSize();
        scaleChess();
        initBoard();
        initChess();
        initCorner();
        initProbar();
        refreshBoard();
        refreshChess();
        refreshCorner();
        refreshProbar();
    })
}
function initAction() {
    function getID(cx, cy) {
        for (var i in chessLocate) {
            if (isHide[i] === true) continue;
            var offx = chessLocate[i].x;
            var offy = chessLocate[i].y;
            for (var j in chessShape[i]) {
                var poi = chessShape[i][j];
                if (inreg(0, cellSize, cx - offx - cellSize * poi.x)
                    && inreg(0, cellSize, cy - offy - cellSize * poi.y))
                    return parseInt(i);
            }
        }
        return -1;
    }
    var extend = false;
    var mouseDown = false;
    var select = -1;
    var clix, cliy // mouselocetion
        , chsx, chsy //chesslocation
        , pox, poy //mouse index in board
        , centx,centy;//select chess center
    function updSelect(x) {
        if (select != -1) $("#chs_" + select).css("opacity", initp);
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
        inMask(select, pox, poy);
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
        inMask(select, pox, poy);
    }
    function down(e){
        mouseDown = true;
        clix = e.clientX, cliy = e.clientY;
        getE("mask").clearRect(0, 0, boardSize, boardSize);
        updSelect(getID(clix, cliy));
        if (select !== -1)
            getPo(), inMask(select, pox, poy);
    }
    function up(e){
        getE("mask").clearRect(0, 0, boardSize, boardSize);
        mouseDown = false;
    }
    function move(e){
        if (mouseDown === true && select !== -1) {
            getPo();
            moveChess(e);
            inMask(select, pox, poy);
        }
        clix = e.clientX, cliy = e.clientY;
    }
    $("#playGround").on('mousedown',down);
    $("#playGround").on('touchstart',function (e){
        down(e.originalEvent.touches[0]);
        return false;
    });
    $("#playGround").on('mousemove',move);
    $("#playGround").on('touchmove',function (e){
        e.preventDefault();
        move(e.originalEvent.touches[0]);
    });
    $("#playGround").on('mouseup touchend',up);
    $(window).keydown(function (e) {
        if(e.keyCode == 81){ //Q
            now = now - 1;
            now = Math.max(now,0);
            boardFace = recorder[now];
            refreshBoard();
        }
        if(e.keyCode == 69){ //E
            now = now + 1;
            now = Math.min(now,recorder.length-1);
            boardFace = recorder[now];
            refreshBoard();
        }
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
            legal: "#6f645e",
            horn: "#a5a7a5",
            rim: "#875f5f",
            unlegal: "#e1d9c4",
            can: "#f5f9f8",
            frameColor : "#ffffff",
            shade : "#3f3f3f",
            player: function (o) {
                switch (o) {
                    case -1: return "#b7b7b7";
                    case 0: return "#ed1c24";
                    case 1: return "#23b14d";
                    case 2: return "#00a2e8";
                    case 3: return "#ffc90d";
                }
                return undefined;
            },
            corner: function (o) {
                switch (o) {
                    case -1: return "#e6eae9";
                    case 0: return "#cf1b24";
                    case 1: return "#239546";
                    case 2: return "#0091cf";
                    case 3: return "#ebb60d";
                }
                return undefined;
            }
        }
    }
    else {
        colorTheme = theme;
    }
}
var roundTime,curTime;