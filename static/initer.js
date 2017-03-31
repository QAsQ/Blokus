/**
 * Created by QAQ on 2017/3/11.
 */
var socket;
var round;
var ratiox,ratioy,bw,bh;
var bars;
var colorTheme;
var stepTime,fullTime;
var username;
var counting = false;


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
    socket.on('disconnect',function (){
        socket.emit("history",{o:owner});
    });
    socket.on('history', function (board){
        hist = board.hist; 
        round = 0;
        for(var ind in hist){
            AddChess(hist[ind]);
        }
        roundTime = board.remain.map(Math.floor);
        curTime = Math.max(0,Math.floor(stepTime-board.cur));
        roundTime[round % 4] -= Math.max(0,board.cur-stepTime);

        refreshBoard();
        refreshChess();
        refreshCorner();
        refreshProbar();


        if(!counting){
            countDown();
            counting = true;
        }
    });
    socket.on('startGame',function (sta){
        $("#start").modal('show');
    });
    socket.on('move',function(Sta){
        roundTime = Sta.remain.map(Math.floor);
        AddChess(Sta);
    });
    socket.on('info',function (room) {
        username = new Array;
        for(var i = 0 ; i < 4 ; i ++){
            if((room.status >> i ) & 1){
                cornerState[i] = i;
            }
            else cornerState[i] = -1;
            username[i] = room.user[i];
        }
        refreshCorner();
        if(room.status === 15){
            socket.emit("history",{})
        }
    });
    socket.on("gameover",function () {
        var counter = [{x:89,id:0},
                       {x:89,id:1},
                       {x:89,id:2},
                       {x:89,id:3}];
        for(var ind in boardFace){
            if(inbod(boardFace[ind]))
                counter[boardFace[ind].o].x--;
        }
        counter.sort(function (a,b) {
            return a.x > b.x;
        });
        var rnk = 1;
        for(var ind in counter){
            $("#left_"+ind).text(counter[ind].x);
            $("#color_"+ind).text(username[counter[ind].id]);
            if(ind != 0 && counter[ind].x != counter[ind-1].x) 
                rnk = 1 + parseInt(ind);
            $("#rank_"+ind).text(rnk);
        }
        $("#status").modal('show');
    });
}
function init(x) {
    owner = x;
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
    initSocket();
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
    socket.emit("info",{});
}
function initAction() {
    function getID(cx, cy) {
        for(var i = 0 ; i < 21 ; i ++){
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
                sta = {round:round,x:pox,y:poy,id:select,sta:chessState[select]};
                AddChess(sta);
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
            legal: "#6f645e",
            horn: "#a5a7a5",
            rim: "#875f5f",
            unlegal: "#e1d9c4",
            can: "#f5f9f8",
            frameColor : "#ffffff",
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
function countDown(){
    if(curTime != 0) curTime --;
    else{
        roundTime[round%4]--;
        roundTime[round%4] = Math.max(roundTime[round%4],0);
    }
    bars[round % 4](roundTime[round % 4],curTime);
    if(round < 84) setTimeout("countDown()",1000);
}