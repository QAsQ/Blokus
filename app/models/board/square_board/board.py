from .piece import Piece, Position
from .data import piece_initial_pos

# 维护一个棋盘的状态，不维护游戏进程
class Board:
    def __init__(self,  piece_shape_set):
        # player_id, piece_id, state, x, y
        self.piece_shape_set = piece_shape_set
        self.pieces = [[] for _ in range(4)]

        for player_id in range(4):
            for piece_id in range(21):
                # TODO should not income player_id
                self.pieces[player_id].append(
                    Piece(self.piece_shape_set[piece_id], player_id, piece_initial_pos[player_id][piece_id]))
        self.drop_history = []

    def get_state(self):
        return {
            "history": self.drop_history
        }

    def try_drop_piece(self, player_id, piece_id, position):
        if player_id < 0 or player_id >= 4:
            return False
        if piece_id < 0 or piece_id >= len(self.piece_shape_set):
            return False
        if not self.pieces[player_id][piece_id].try_drop(position):
            return False

        self.drop_history.append({
            "player_id": player_id,
            "piece_id": piece_id,
            "position": position.to_dict()
        })
        for piece_player_id, piece_list in enumerate(self.pieces):
            for piece in piece_list:
                piece.update_possible_position(
                    self.piece_shape_set[piece_id][position.state], 
                    position, 
                    player_id == piece_player_id
                )
        return True

    def auto_drop_piece(self, player_id):
        piece_id, position = self._get_one_possible_position(player_id)
        if self.try_drop_piece(player_id, piece_id, position):
            self.drop_history.append({
                "player_id": player_id,
                "piece_id": piece_id,
                "position": position.to_dict()
            })
            return True
        else:
            return False
    
    def is_ended(self):
        return len(self.drop_history) >= len(self.piece_shape_set) * 4

    def _get_one_possible_position(self, player_id):
        position = Position()
        for piece_id in range(20, -1, -1):
            for position.state in range(8):
                position = self.pieces[player_id][piece_id].get_one_possible_position()
                if position.state != -1:
                    return piece_id, position
        return -1, position

