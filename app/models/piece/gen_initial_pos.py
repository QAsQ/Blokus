from square_piece import Piece as SquarePiece
from square_piece import piece_shape_set_generate as SquareShapeGenerate
from trigon_piece import Piece as TrigonPiece
from trigon_piece import piece_shape_set_generate as TrigonShapeGenerate
import json

def GenInitialPos(Piece, piece_shapes, board_size, all_start_pos, board_type):
    f = open(board_type + "_initial_state.py", 'w')
    f.writelines('#player_id(range(4)) & piece_id(range(21)) & piece_state(range(8)) & i(range(20)) & j(range(20))\n')
    f.writelines(board_type + "_initial_possible_position = ")
    initial_position = []
    for start_point in all_start_pos:
        initial_pos = []
        for piece_shape in piece_shapes:
            piece = Piece(piece_shape, start_point, board_size)
            initial_pos.append(piece.possible_position)
        initial_position.append(initial_pos)
    f.write(json.dumps(initial_position))
    f.close()

GenInitialPos(SquarePiece, SquareShapeGenerate(), 20, [(0, 0), (0, 19), (19, 19), (19, 0)], "square_standard")
GenInitialPos(SquarePiece, SquareShapeGenerate(), 14, [(4, 4), (9, 9)], "square_duo")
GenInitialPos(TrigonPiece, TrigonShapeGenerate(), 8, [(10, 2, 1), (2, 10, 1), (10, 10, 1)], "trigon_trio")
'''
datas = {
    "square_standard": {
        "board_type": "square_standard",
        "start_point": [(0, 0), (0, 19), (19, 19), (19, 0)], 
        "piece_shape": square_piece_shape_generate(),
        "player_num": 4,
        "board_size": 20,
        "init_locate": square_standard_init_locate, 
        "init_state": square_standard_init_state, 
        "progress_bar_end_point": square_standard_progress_bar_end_point
    },
    "square_duo": {
        "board_type": "square_duo",
        "start_point": [(4, 4), (9, 9)], 
        "piece_shape": square_piece_shape_generate(),
        "player_num": 2,
        "board_size": 14,
        "init_locate": square_duo_init_locate, 
        "init_state": square_duo_init_state, 
        "progress_bar_end_point": square_duo_progress_bar_end_point
    },
    "trigon_trio": {
        "board_type": "trigon_trio",
        "start_point": [(10, 2, 1), (2, 10, 1), (10, 10, 1)], 
        "piece_shape": trigon_piece_shape_generate(),
        "player_num": 3,
        "board_size": 8,
        "init_locate": trigon_trio_init_locate, 
        "init_state": trigon_trio_init_state, 
        "progress_bar_end_point": trigon_trio_progress_bar_end_point
    },
}
'''
