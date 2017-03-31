/**
 * Created by QAQ on 2017/3/3.
 */

var boardFace;
var lastStep;
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
function createProbar(){
    for(var i = 0 ; i < 4 ; i ++){
        var pgb= $("<canvas id = \"pgb_" + i + "\"></canvas>");//progressbar
        $("#playGround").append(pgb);
    }
}
function initProbar(){
    var st = [xy(5,4),xy(4,25),xy(25,26),xy(26,5)];
    var ed = [xy(25,4),xy(4,5),xy(5,26),xy(26,25)];
    bars = new Array;
    for(var i = 0 ; i < 4 ; i ++){
        $("#pgb_" + i).attr({
            "width": cellSize * 30,
            "height": cellSize * 30,
        }).css({
            left:"0px",
            top: "0px",
            position:"absolute",
            "z-index":"-2",
        });
        bars[i] = prograssbar(i,mucell(st[i]), mucell(ed[i]));
    }
}
function refreshProbar() {
    for(var i = 0 ; i < 4 ; i ++){
        bars[i](roundTime[i],0);
    }
    if(round != -1) bars[round % 4](roundTime[round % 4],curTime);
}
function initCorner() {
    var locate = [xy(1,1),xy(1,25),xy(25,25),xy(25,1)];
    for(var i = 0 ; i < 4 ; i ++) {
        $("#corn_" + i).attr({
            "width": cellSize * 4,
            "height": cellSize * 4,
        }).css({
            left: locate[i].x * cellSize + "px",
            top: locate[i].y * cellSize + "px",
            position: "absolute",
            "z-index": "-3",
        });
        $("#n"+i).css({
            left: (locate[i].x+2) * cellSize - ($("#n"+i).width() + 20 )/ 2 + "px",
            top: (locate[i].y+2) * cellSize - $("#n"+i).height() / 2 + "px",
            position: "absolute",
            "z-index": "-1",
        });
        
    }
}
function refreshCorner() {
    var square = [xy(2,2),xy(2,0),xy(0,0),xy(0,2)];
    for(var i = 0 ; i < 4 ; i ++) {
        var e = getE("corn_" + i);
        e.beginPath();
        e.fillStyle = colorTheme.corner(cornerState[i]);
        e.arc(cellSize * 2, cellSize * 2, cellSize * 2, 0, Math.PI * 2, true);
        e.closePath();
        e.fill();
        e.fillRect(square[i].x * cellSize, square[i].y * cellSize, cellSize * 2, cellSize * 2);
        //drawCell(square[i],colorTheme.corner(cornerState[i]),e);
        $("#n"+i).text(username[i]);
    }
    if(round !== -1){
        $("#corn_"+(round%4)).css("opacity",1);
    }
}
function nextRound() {
    if(round !== -1) $("#corn_"+(round%4)).css("opacity",ncor);
    round++;
    curTime = stepTime;
    $("#corn_"+(round%4)).css("opacity",1);
}

function AddChess(Sta) {
    console.log(round);
    console.log(Sta);
    if(round !== Sta.round) return;
    console.log(Sta);
    var own = Sta.round % 4;
    if(Sta.sta === -1){
        cornerState[own] = -1;
        refreshCorner();
        return;
    }
    chs = sCS[Sta.id].map(function (s){ 
        return oxy(own,s.x,s.y);
    });
    if(own === owner){
        socket.emit('move',Sta);
        if(Sta.sta !== -1){
            isHide[Sta.id] = true;
            $("#chs_"+Sta.id).hide();
        }
    }
    var _sta = 0;
    if (Sta.sta & 1) _sta = flipChessShape(chs, _sta);
    while (Sta.sta !== _sta) {
        _sta = rotateChessShape(chs,_sta, true);
    }

    chs = chs.map(upd(Sta.x,Sta.y));

    boardFace = boardFace.concat(chs);
    lastStep = chs;
    drawLast();
    nextRound();
    refreshProbar();
    refreshBoard();
}
function drawLast() {
    var e = getE("last");
    e.clearRect(0,0,boardSize,boardSize);
    for(var ind in lastStep){
        drawCell(lastStep[ind],colorTheme.corner(lastStep[ind].o),e);
    }
    for(var ind in lastStep){
        drawFrame(lastStep[ind],colorTheme.rim,e);
    }
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
        "z-index":"-5",
        opacity: 1
    });
    $("#mask").attr({
        "width": boardSize,
        "height": boardSize,
    }).css({
        position:"absolute",
        top:dxy + "px",
        left:dxy + "px",
        "z-index":"-4",
        opacity: 0.7
    });
    $("#last").attr({
        "width": boardSize,
        "height": boardSize,
    }).css({
        position:"absolute",
        top:dxy + "px",
        left:dxy + "px",
        "z-index":"-3.5",
        opacity: 1
    });
}
function clearFace() {
    boardFace = new Array;
    boardFace.push(oxy(0, -1, -1)
        , oxy(1, -1, 20)
        , oxy(2, 20, 20)
        , oxy(3, 20, -1));
    isHide = new Array;
    lastStep = new Array;
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
            if (inThe(owners.concat(boardFace))(poi) === false ) {
                drawCell(poi, colorTheme.can, e);
            }
        }
    }
}
function drawHornAndCell(e) {
    var drawable = boardFace.filter(inbod);
    for (var index in drawable) {
        drawCell(drawable[index], colorTheme.player(drawable[index].o), e);
    }
    for (var index in drawable) {
        drawFrame(drawable[index], colorTheme.frameColor, e);
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
    drawHornAndCell(e);
    drawLine(e);
    drawLast();
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

function prograssbar(id,st,ed){
    return function(tim,cur){
        var vx = ed.x - st.x;
        var vy = ed.y - st.y;
        var fir = tim / (fullTime+stepTime*5);
        var sec = (tim + cur*5) / (fullTime+stepTime*5);
        var Fir = xy(st.x + vx * fir,st.y + vy * fir);
        var Sec = xy(st.x + vx * sec,st.y + vy * sec);
        var e = getE("pgb_"+id);
        e.clearRect(0,0,cellSize * 30,cellSize * 30);
        e.strokeStyle = colorTheme.corner(id);
        e.lineWidth = Math.min(8,cellSize / 2); e.beginPath(); e.moveTo(st.x, st.y); e.lineTo(Fir.x, Fir.y); 
        e.stroke();

        e.strokeStyle = colorTheme.horn;
        e.beginPath(); e.moveTo(Fir.x,Fir.y); e.lineTo(Sec.x,Sec.y);
        e.stroke();

        if(cur !== 0 || tim !== 0){
            e.beginPath();
            if(cur == 0) e.fillStyle = colorTheme.corner(id);
            else e.fillStyle = colorTheme.horn;
            e.arc(Sec.x,Sec.y,e.lineWidth / 2, 0, Math.PI * 2, true);
            e.closePath();
            e.fill();
        }
    }
}