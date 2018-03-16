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
            backgroundColor: 0xfcfafb,
            board: {
                dividing_line: 0xffffff,
                dividing_line_width: 3,
                frame: 0xe6eae9,
                progress_bar:{
                    accuracy: [0xed1c24, 0x23b14d, 0x00a2e8, 0xffc90d],
                    additional: 0xafafaf,
                    particles: {
                        accuracy: [0xed1c24, 0x23b14d, 0x00a2e8, 0xffc90d],
                        additional: 0xafafaf
                    }
                }
            },
            piece: {
                initial_alpha: 0.7,
                onselect_alpha: 0.9,
                dropped_alpha: 1,
                shadow: {
                    legal: 0x6f645e,
                    unlegal: 0xe1d9c4
                },
                spectator: 0xb7b7b7,
                dividing_line: 0xffffff,
                dividing_line_width: 3,
                cell: [0xed1c24, 0x23b14d, 0x00a2e8, 0xffc90d],
                last_drop: [0xcf1b24, 0x239546, 0x0091cf, 0xebb60d]
            }
        }
    }
    return null;
}