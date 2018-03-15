/**
 * Created by QAQ on 2017/12/3.
 */

function Point(x, y) {
    return new PIXI.Point(x, y);
}

var gPiecesLocate = [
    Point(19, -4), Point(13, -4), Point(-4, -4), Point(7, -4), Point(9, 23),
    Point(18, 23), Point(0, -4), Point(-4, 6), Point(0, 23), Point(-4, 11),
    Point(23, 22), Point(22, -4), Point(-4, 17), Point(23, 17), Point(-4, -1),
    Point(4, 23), Point(-4, 22), Point(13, 23), Point(23, 7), Point(23, 12),
    Point(23, 1)
]

var gInitState = [
    0, 0, 0, 0, 0, 2, 2, 2, 6, 2, 7, 6, 7, 7, 0, 7, 4, 4, 6, 0, 5
]

gProgressBarEndPointList= [
    Point(0, -1), Point(20, -1), 
    Point(-1, 20), Point(-1, 0), 
    Point(20, 21), Point(0, 21), 
    Point(21, 0), Point(21, 20)
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
            tampColor: 0xafafaf,
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