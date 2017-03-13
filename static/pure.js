/**
 * Created by QAQ on 2017/3/11.
 */
function count(arrs,x) {
    var ret = 0;
    for(var ind in arrs)
        if(arrs[ind]===x)
            ret++;
    return ret;
}
function drawFrame(cell,color,e) {
    e.strokeStyle = color;
    var ox = cellSize * cell.x;
    var oy = cellSize * cell.y;
    e.lineWidth = 1;
    e.beginPath();
    e.moveTo(ox, oy);
    e.lineTo(cellSize + ox, oy), e.lineTo(cellSize + ox, cellSize + oy);
    e.lineTo(ox, cellSize + oy), e.lineTo(ox, oy);
    e.stroke();
}
function drawCell(cell, color, e) {
    e.fillStyle = color;
    var ox = cellSize * cell.x;
    var oy = cellSize * cell.y;
    e.fillRect(ox , oy , cellSize, cellSize);
}
function getE(name) {
    return document.getElementById(name).getContext("2d");
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
        return oxy(cell.o, cell.x + x, cell.y + y);
    }
}

function xy(x, y) {
    return {x: x, y: y};
}
function oxy(o, x, y) {
    return {o: o, x: x, y: y};
}

function inreg(l, r, v) {
    return l <= v && v <= r;
}
function inbod(pane) {
    return inreg(0, 19, pane.x) && inreg(0, 19, pane.y);
}
