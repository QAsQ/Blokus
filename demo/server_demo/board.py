# board
# can drop piece to board
# can auto drop one piece to board
# own state?
#  own chess state
#       is_drop
#  know every chess's possible position


class Position:
    def __init__(self, state=-1, x=-1, y=-1):
        self.state = state
        self.x = x
        self.y = y

    def to_dict(self):
        return {
            "state": self.state,
            "x": self.x,
            "y": self.y
        }


def generate_piece_initialize_legal_position(piece_shape, player_id):
    pass


class Piece:
    def __init__(self, piece_shape_set, player_id):
        self.shape_set = piece_shape_set
        self.possible_position = []

        for state in range(8):
            self.possible_position.append(
                generate_piece_initialize_legal_position(
                    self.shape_set[state],
                    player_id
                )
            )
        self.is_drop = False

    def try_drop_to_board(self, position):
        if self.is_drop:
            return False
        if not self.is_possible_position(position):
            return False
        self.is_drop = True

    def is_possible_position(self, position):
        if 0 > position.state or position.state > 8:
            return False
        if 0 > position.x or 20 < position.x:
            return False
        if 0 > position.y or 20 < position.y:
            return False
        return self.possible_position[position.state][position.x][position.y]

    def get_one_possible_position(self):
        if self.is_drop:
            return Position()
        for state in range(8):
            for x in range(20):
                for y in range(20):
                    if self.possible_position[state][x][y]:
                        return Position(state, x, y)
        return Position()

    def update_possible_position(self, piece_shape, is_same_player):
        pass


class Board:
    def __init__(self,  piece_shape_set):
        # player_id, piece_id, state, x, y
        self.piece_shape_set = piece_shape_set
        self.pieces = [[] for _ in range(4)]

        for player_id in range(4):
            for piece_id in range(21):
                #TODO should not income player_id
                self.pieces[player_id].append(Piece(self.piece_shape_set[piece_id], player_id))
        self.drop_history = []

    def get_state(self):
        pieces_state = [[] for _ in range(4)]
        for player_id in range(4):
            for piece_id in range(21):
                pieces_state[player_id].append(self.pieces[player_id][piece_id].get_state())
        return {
            "pieces": pieces_state,
            "history": self.drop_history
        }

    def try_drop_piece(self, player_id, piece_id, position):
        if player_id < 0 or player_id >= len(self.piece_shape_set):
            return False
        if piece_id < 0 or piece_id >= len(self.piece_shape_set):
            return False
        if not self.pieces[player_id][piece_id].is_possible_position(position):
            return False

        self.drop_history.append({
            "player_id": player_id,
            "piece_id": piece_id,
            "position": position.to_dict()
        })
        self.pieces[player_id][piece_id].drop_to_board()
        self.drop_history.append(self.drop_history)

    def auto_drop_piece(self, player_id):
        piece_id, position = self._get_one_possible_position(player_id)
        if self.try_drop_piece(player_id,piece_id, position):
            self.drop_history.append({
                "player_id": player_id,
                "piece_id": piece_id,
                "position": position.to_dict()
            })

    def _get_one_possible_position(self, player_id):
        position = Position()
        for piece_id in range(21):
            for position.state in range(8):
                position = self.pieces[player_id][piece_id].get_one_possible_position()
                if position.state != -1:
                    return piece_id, position
        return -1, position
