class Position:
    def __init__(self, state=-1, x=-1, y=-1):
        self.state = state
        self.x = x
        self.y = y
    
    def from_dict(self, data):
        self.state = data["state"]
        self.x = data["x"] 
        self.y = data["y"]
        return self

    def to_dict(self):
        return {
            "state": self.state,
            "x": self.x,
            "y": self.y
        }


def generate_piece_initialize_legal_position(piece_shape, player_id):
    return [[True for _ in range(20)] for _ in range(20)]


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
        self.position = Position()

    def try_drop(self, position):
        if self.is_drop:
            return False
        if not self.is_possible_position(position):
            return False
        self.is_drop = True
        self.position = position

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

    def get_state(self):
        return {
            "is_drop": self.is_drop,
            #"possible_position": self.possible_position,
            "position": self.position.to_dict()
        }

