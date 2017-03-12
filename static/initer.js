/**
 * Created by QAQ on 2017/3/11.
 */
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
    socket.on('connect',function() { });
    socket.on('battle',function(Sta){
        if(Sta.o === owner) return;

        nextRound();
        if(Sta.sta === -1){
            cornerState[Sta.o] = -1;
            initCorner();
            if(count(cornerState,-1) === 4)
                alert("over!");
        }
        else {
            AddChess(Sta);
            console.log(cornerState);
            if (round % 4 === owner) {
                if(cornerState[owner] === -1 || availableRound() === false){
                    nextRound();
                    cornerState[owner] = -1;
                    initCorner();
                    socket.emit('battle',  {o:owner,sta:-1,x:-1,y:-1,id:-1});
                }
            }
        }
    });
    socket.on('disconnect',function (){
        socket.emit("wantFace",{o:owner});
    });
    socket.on('loadsta', function (val){
        console.log(val);
        clearFace();
        round = val.length;
        for(var ind in val){
            if(val[ind].sta === -1)
                cornerState[val[ind].o] = -1;
            else
                AddChess(val[ind]);
        }
        refreshBoard();
        refreshChess();
        initCorner();
    }
    socket.on('romsta',function (online) {
        for(var i = 0 ; i < 4 ; i ++){
            if((online.o >> i ) & 1) cornerState[i] = i;
            else cornerState[i] = -1;
        }
        if(online.o === 15 && round === -1){
            alert("Game Start!");
            nextRound();
        }
        initCorner();
    });
    socket.on()
}
function fuck(){
    socket.emit("wantFace",{o:owner});
}
function init(x) {
    owner = x;
    round = -1;
    initColorTheme();
    clearFace();
    initSize();
    initBoard();
    initChess();
    createChess();
    createCorner();
    initCorner();
    refreshBoard();
    refreshChess();
    initAction();
    initSocket();
    $(window).resize(function () {
        initSize();
        scaleChess();
        initBoard();
        initChess();
        initCorner();
        refreshBoard();
        refreshChess();
    })
    socket.emit('login',{o:owner});
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
    function updSelect(x) {
        console.log(x);
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

    $(window).mousedown(function (e) {
        mouseDown = true;
        clix = e.clientX, cliy = e.clientY;
        getE("mask").clearRect(0, 0, boardSize, boardSize);
        updSelect(getID(clix, cliy));
        if (select !== -1)
            getPo(), inMask(select, pox, poy);
    });
    $(window).mouseup(function (e) {
        if (select != -1 && inBoard(chessShape[select], pox, poy) === "legal") {
            if(round % 4 === owner){
                isHide[select] = true;
                chessIn(select, pox, poy);
                nextRound();
            }
            getE("mask").clearRect(0, 0, boardSize, boardSize);
        }
        mouseDown = false;
    });
    $(window).mousemove(function (e) {
        if (mouseDown === true && select !== -1) {
            getPo();
            moveChess(e);
            inMask(select, pox, poy);
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
            },
            corner: function (o) {
                switch (o) {
                    case -1: return "#ffffff";
                    case 0: return "#de2c2e";
                    case 1: return "#24c124";
                    case 2: return "#42bfe1";
                    case 3: return "#c3c536";
                }
                return undefined;
            }
        }
    }
    else {
        colorTheme = theme;
    }
}
