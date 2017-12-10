/**
 * Created by QAQ on 2017/12/3.
 */

function Point(x, y) {
    return new PIXI.Point(x, y);
}

var gPiecesLocate = [
    Point(29,5),Point(28,5),Point(29,17),Point(32,5),Point(32,20)
    ,Point(29,16),Point(41,8),Point(35,17),Point(34,8),Point(37,5)
    ,Point(35,5),Point(37,17),Point(31,14),Point(35,8),Point(41,13)
    ,Point(29,10),Point(33,10),Point(37,14),Point(37,13),Point(31,10)
    ,Point(29,6)
];

var gPiecesCellList= [
    [Point(0, 0)],
    [Point(0, 0), Point(1, 0)],
    [Point(0, 0), Point(0, 1), Point(1, 0)],
    [Point(0, 0), Point(1, 0), Point(2, 0)],
    [Point(0, 0), Point(0, 1), Point(1, 0), Point(1, 1)],
    [Point(0, 0), Point(0, 1), Point(0, 2), Point(1, 1)],
    [Point(0, 0), Point(0, 1), Point(0, 2), Point(0, 3)],
    [Point(0, 0), Point(1, 0), Point(2, 0), Point(0, 1)],
    [Point(0, 0), Point(0, 1), Point(1, 1), Point(1, 2)],
    [Point(0, 0), Point(0, 1), Point(1, 0), Point(2, 0), Point(3, 0)],
    [Point(0, 0), Point(0, 1), Point(0, 2), Point(1, 1), Point(2, 1)],
    [Point(0, 0), Point(0, 1), Point(0, 2), Point(1, 0), Point(2, 0)],
    [Point(0, 0), Point(1, 0), Point(1, 1), Point(2, 1), Point(3, 1)],
    [Point(0, 0), Point(0, 1), Point(1, 1), Point(2, 1), Point(2, 2)],
    [Point(0, 0), Point(0, 1), Point(0, 2), Point(0, 3), Point(0, 4)],
    [Point(0, 0), Point(0, 1), Point(0, 2), Point(1, 0), Point(1, 1)],
    [Point(0, 0), Point(1, 0), Point(1, 1), Point(2, 1), Point(2, 2)],
    [Point(0, 0), Point(1, 0), Point(2, 0), Point(0, 1), Point(2, 1)],
    [Point(0, 0), Point(0, 1), Point(1, 1), Point(1, 2), Point(2, 1)],
    [Point(1, 0), Point(1, 1), Point(1, 2), Point(0, 1), Point(2, 1)],
    [Point(0, 0), Point(0, 1), Point(0, 2), Point(0, 1), Point(1, 1)]
];

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