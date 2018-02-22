/**
 * Created by QAQ on 2017/12/3.
 */

function Point(x, y) {
    return new PIXI.Point(x, y);
}

var gPiecesLocate = [
    Point(34,0),Point(31,0),Point(24,0),Point(27,0),Point(36,3),
    Point(26,3),Point(24,3),Point(32,3),Point(29,3),Point(35,15),
    Point(24,16),Point(26,8),Point(29,16),Point(37,8),Point(24,8),
    Point(36,11),Point(30,8),Point(31,13),Point(26,13),Point(28,10),
    Point(34,8),
]

gProgressBarEndPointList= [
    Point(0, -2), Point(20, -2), 
    Point(-2, 20), Point(-2, 0), 
    Point(20, 22), Point(0, 22), 
    Point(22, 0), Point(22, 20)
]


function ColorThemeFactory(type) {
    if (type === "default") {
        return {
            boardBackgroundColor: 0xffffff,
            boardLineColor: "#e6eae9",
            pieceColor: {
                "0": 0xed1c24,
                "1": 0x23b14d,
                "2": 0x00a2e8,
                "3": 0xffc90d,
               "-1": 0xb7b7b7
            },
            legal: "#6f645e",
            horn: "#d5d7d5",
            rim: "#875f5f",
            unlegal: "#e1d9c4",
            can: "#f5f9f8",
            frameColor: "#ffffff",
            shade: "#e6eae9",
            corner: function (o) {
                switch (o) {
                    case -1:
                        return "#e6eae9";
                    case 0:
                        return "#cf1b24";
                    case 1:
                        return "#239546";
                    case 2:
                        return "#0091cf";
                    case 3:
                        return "#ebb60d";
                }
                return null;
            }
        }
    }
    return null;
}

function AdhocstateGenerate() {
    var state = {};
    state.playerstate = [];
    for (var i = 0; i < 4; i++){
        state.playerstate.push({
            remainingTime: {
                totalTime: 12,
                temporaryTime: 5
            },
            wasAuto: false
        });
    }
    state.pieceState = [];
    for (var i = 0; i < 4; i++ ){
        var pieceState = [];
        for (var j  = 0; j <= 20; j++)
        {
            pieceState.push({
                isDown:false,
                state: 0,
                x: 0,
                y: 0
            })
        }
        state.pieceState.push(pieceState);
    }
    state.pieceState[0][2] = {
        isDown: true,
        state: 0,
        x: 3,
        y: 2
    };
    state.pieceState[1][12] = {
        isDown: true,
        state: 0,
        x: 1,
        y: 12
    };

    state.pieceState[1][5] = {
        isDown: true,
        state: 0,
        x: 9,
        y: 10
    };
    return state;
}