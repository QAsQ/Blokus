# 维护一个棋盘的状态，不维护游戏进程
class Board:
    def __init__(self,  pieces, board_type):
        self.board_type = board_type
        self.drop_history = []
        self.amount_cells = 0
        self.dropped_cells = 0

        self.pieces = pieces
        for player in self.pieces:
            for piece in player:
                self.amount_cells += piece.cell_num
            
        self.player_num = len(self.pieces)
        self.piece_num = len(self.pieces[0]) #at least one player

    def get_info(self, start=-1):
        if start < 0:
            return {
                "board_type": self.board_type,
                "history": self.drop_history,
                "board_progress": self.dropped_cells * 1.0 /  self.amount_cells
            }
        else:
            return {
                "board_type": self.board_type,
                "history": {
                    "start": start,
                    "result": self.drop_history[start:]
                },
                "board_progress": self.dropped_cells * 1.0 /  self.amount_cells
            }

    def try_drop_piece(self, player_id, piece_id, position):
        if player_id < 0 or player_id >= self.player_num:
            return False
        if piece_id < 0 or piece_id >= self.piece_num:
            return False
        if not self.pieces[player_id][piece_id].try_drop(position):
            return False
        self.dropped_cells += self.pieces[player_id][piece_id].cell_num

        self.drop_history.append({
            "player_id": player_id,
            "piece_id": piece_id,
            "position": position
        })
        for piece_player_id, piece_list in enumerate(self.pieces):
            for piece in piece_list:
                piece.update_possible_position(
                    self.pieces[player_id][piece_id].get_cell_list(position['state']),
                    position, 
                    player_id == piece_player_id
                )
        
        return True

    def auto_drop_piece(self, player_id):
        piece_id, position = self._get_one_possible_position(player_id)
        if self.try_drop_piece(player_id, piece_id, position):
            return True
        else:
            return False
    
    def get_result(self):
        res = [ {"left": int(self.amount_cells / self.player_num), "score": 0} for _ in range(self.player_num)]

        for drop in self.drop_history:
            res[drop['player_id']]["left"] -= self.pieces[drop['player_id']][drop['piece_id']].cell_num
            res[drop['player_id']]["score"] += self.pieces[drop['player_id']][drop['piece_id']].cell_num * 15
        
        return res
    
    def is_ended(self, check_player_id = -1):
        if check_player_id == -1:
            for player_id in range(self.player_num):
                piece_id, _ = self._get_one_possible_position(player_id)
                if piece_id != -1:
                    return False
            return True

        piece_id, _ = self._get_one_possible_position(check_player_id)
        return piece_id == -1

    def _get_one_possible_position(self, player_id):
        for piece_id in range(20, -1, -1):
            position = self.pieces[player_id][piece_id].get_one_possible_position()
            if position['state'] != -1:
                return piece_id, position
        return -1, position

import copy
from .piece.square_piece import Piece as Square_piece
from .piece.square_piece import piece_shape_set_generate as square_piece_shape_generate
from .piece.square_standard_initial_state import square_standard_initial_possible_position  
from .piece.square_standard_initial_pos import square_standard_init_locate, square_standard_init_state, square_standard_progress_bar_end_point
from .piece.square_duo_initial_pos import square_duo_init_locate, square_duo_init_state, square_duo_progress_bar_end_point
from .piece.trigon_piece import Piece as Trigon_piece
from .piece.trigon_piece import piece_shape_set_generate as trigon_piece_shape_generate
from .piece.trigon_trio_initial_pos import trigon_trio_init_locate, trigon_trio_init_state, trigon_trio_progress_bar_end_point

class BoardFactory:
    @staticmethod
    def generate_pieces(board_type):
        args = {
            "square_standard": (
                Square_piece, 
                square_piece_shape_generate(),
                [(0, 0), (0, 19), (19, 19), (19, 0)], 
                20, 
                square_standard_initial_possible_position
            ), 
            "square_duo": (
                Square_piece, 
                square_piece_shape_generate(),
                [(4, 4), (9, 9)], 
                14,
                None
            ),
            "trigon_trio": (
                Trigon_piece, 
                trigon_piece_shape_generate(),
                [(0, 0), (1, 1), (2, 2)], 
                8,
                None
            )
        }
        if board_type in args:
            Piece, piece_shape, start_point, board_size, initialize_position = args[board_type]
            pieces = [[] for _ in range(len(start_point))]
            for player_id in range(len(start_point)):
                for piece_id in range(len(piece_shape)):
                    piece = Piece(
                        piece_shape[piece_id], 
                        start_point[player_id], 
                        board_size,
                        copy.deepcopy(initialize_position[player_id][piece_id]) if initialize_position is not None else None
                    )
                    pieces[player_id].append(piece)
            return pieces
        else:
            return "board_type {} invalid".format(board_type)

    @staticmethod
    def createBoard(board_type):
        pieces = BoardFactory.generate_pieces(board_type)
        
        if isinstance(pieces, str):
            return pieces
        return Board(pieces, board_type)
    
    @staticmethod
    def getBoardData(board_type):
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
        if board_type not in datas:
            return "board type {} is not defined!".format(board_type)
        
        return datas[board_type]
    