# 维护一个棋盘的状态，不维护游戏进程
class Board:
    def __init__(self,  pieces):
        # player_id, piece_id, state, x, y
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
                "board_type": "square_standard",
                "history": self.drop_history,
                "board_progress": self.dropped_cells * 1.0 /  self.amount_cells
            }
        else:
            return {
                "board_type": "square_standard",
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
        res = [ {"left": int(self.amount_cells / 4), "score": 0} for _ in range(4)]

        for drop in self.drop_history:
            res[drop['player_id']]["left"] -= self.pieces[drop['player_id']][drop['piece_id']].cell_num
            res[drop['player_id']]["score"] += self.pieces[drop['player_id']][drop['piece_id']].cell_num * 15
        
        return res
    
    def is_ended(self, check_player_id = -1):
        if check_player_id == -1:
            for player_id in range(4):
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
from .piece.square_standard_initial_pos import piece_initial_pos as square_standard_initial_pos

class BoardFactory:
    @staticmethod
    def generate_pieces(board_type):
        args = {
            "square_standard": (
                Square_piece, 
                square_piece_shape_generate(),
                [(0, 0), (0, 19), (19, 19), (19, 0)], 
                20, 
                square_standard_initial_pos
            ) 
        }
        if board_type in args:
            Piece, piece_shape, start_point, board_size, initialize_position = args[board_type]
            pieces = [[] for _ in len(start_point)]
            for player_id in len(initialize_position):
                for piece_id in len(piece_shape):
                    piece = Piece(
                        piece_shape[piece_id], 
                        start_point[player_id], 
                        board_size,
                        copy.deepcopy(initialize_position[player_id][piece_id])
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

        return Board(pieces)
    
    @staticmethod
    def getBoardData(board_type):
        datas = {
            "square_standard": {
                "start_point": [(0, 0), (0, 19), (19, 19), (19, 0)], 
                "piece_shape": square_piece_shape_generate()
            }
        }
        if board_type not in datas:
            return "board type {} is not defined!".format(board_type)
        
        return datas['board_type']
    