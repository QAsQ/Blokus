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
];

var gInitState = [
    0, 0, 0, 0, 0, 2, 2, 2, 6, 2, 7, 6, 7, 7, 0, 7, 4, 4, 6, 0, 5
];

gProgressBarEndPointList= [
    Point(0, -1), Point(20, -1), 
    Point(-1, 20), Point(-1, 0), 
    Point(20, 21), Point(0, 21), 
    Point(21, 0), Point(21, 20)
];

function trans_color(color){
    return parseInt(color.slice(1), 16);
}
function ColorThemeFactory(type) {
    if (type === "default") {
        return {
            backgroundColor: trans_color("#f2f0f1"),
            board: {
                dividing_line: trans_color("#ffffff"),
                dividing_line_width: 3,
                frame: trans_color("#e6eae9"),
                progress_bar:{
                    bar_width: 7,
                    accuracy: [trans_color("#ed1c24"), trans_color("#23b14d"), trans_color("#00a2e8"), trans_color("#ffc90d")],
                    additional: trans_color("#a1a3a4"),
                    particles: {
                        accuracy: [trans_color("#cf1b24"), trans_color("#239546"), trans_color("#5d92b1"), trans_color("#D69723")],
                        additional: trans_color("#a1a3a4")
                    }
                }
            },
            piece: {
                initial_alpha: 0.4,
                onselect_alpha: 0.8,
                dropped_alpha: 1,
                //shadow: trans_color("#6f645e"),
                shadow: trans_color("#949293"),
                //shadow: {
                //    legal: trans_color("#6f645e"),
                //    unlegal: trans_color("#e1d9c4")
                //},
                spectator: trans_color("#b7b7b7"),
                dividing_line: trans_color("#ffffff"),
                dividing_line_width: 3,
                cell: [trans_color("#f2542d"), trans_color("#80ba04"), trans_color("#1da6f0"), trans_color("#feb923")],
                initial:[trans_color("#cf1b24"), trans_color("#239546"), trans_color("#006BA3"), trans_color("#D69723")],
                last_drop: [trans_color("#cf1b24"), trans_color("#239546"), trans_color("#006BA3"), trans_color("#D69723")]
            }
        }
    }
    return null;
}
