/**
 * Created by QAQ on 2017/3/11.
 */
function drawCell(cell, color, e) {
    e.fillStyle = color;
    e.fillRect(cellSize * cell.x, cellSize * cell.y, cellSize, cellSize);
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
