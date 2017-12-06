from data import Point

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

def can_place(piece_set, coordinate_x, coordinate_y):
    for piece_point in piece_set:
        if piece_point.x + coordinate_x >= 20 or piece_point.y + coordinate_y >= 20:
            return 0
    return 1


def same_point(point1, point2):
    return point1.x == point2.x and point1.y == point2.y

# 0-lack of corner
# 1-can be placed
# 2-occupied or share edge with same color or illegal or out of board


def generate_piece_initialize_legal_position(piece_shape, player_id):
    begin_point = [Point(-1, -1), Point(20, -1), Point(20, 20), Point(-1, 20)]
    dir_point = [Point(-1, -1), Point(1, -1), Point(1, 1), Point(-1, 1)]
    begin_position = [[0 for j in range(20)] for i in range(20)]
    for i in range(20):
        for j in range(20):
            legal_place = can_place(piece_shape, i, j)
            if legal_place == 0:
                begin_position[i][j] = 2
                continue
            if begin_position[i][j] == 2:
                continue
            can_be_placed = 0
            for point in piece_shape:
                if same_point(Point(i + point.x + dir_point[player_id].x, j + point.y + dir_point[player_id].y), begin_point[player_id]):
                    can_be_placed = 1
                    break
            begin_position[i][j] = can_be_placed
    return begin_position

def occupied(act_pos, ano_pos):
    for actp in act_pos:
        for anop in ano_pos:
            if same_point(actp, anop):
                return 1
    return 0

def share_edge(act_pos, ano_pos):
    for actp in act_pos:
        for anop in ano_pos:
            if same_point(Point(actp.x + 1, actp.y), anop):
                return 1
            if same_point(Point(actp.x - 1, actp.y), anop):
                return 1
            if same_point(Point(actp.x, actp.y + 1), anop):
                return 1
            if same_point(Point(actp.x, actp.y - 1), anop):
                return 1
    return 0

def exist_corner(act_pos, ano_pos):
    dir_point = [Point(-1, -1), Point(1, -1), Point(1, 1), Point(-1, 1)]
    for actp in act_pos:
        for anop in ano_pos:
            for direction in range(4):
                if same_point(Point(actp.x + dir_point[direction].x, actp.y + dir_point[direction].y), anop):
                    return 1
    return 0

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

    def try_drop(self, position):
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

    # 0-lack of corner
    # 1-can be placed
    # 2-occupied or share edge with same color or illegal or out of board

    def update_possible_position(self, piece_shape, position, is_same_player):
        another_position = []
        for pos in piece_shape:
            another_position.append(
                Point(pos.x + position.x, pos.y + position.y))
        for state in range(8):
            for i in range(20):
                for j in range(20):
                    if self.possible_position[state][i][j] == 2:
                        continue
                    actual_position = []
                    for pos in self.shape_set[state]:
                        actual_position.append(Point(pos.x + i, pos.y + j))
                    if occupied(actual_position, another_position):
                        self.possible_position[state][i][j] = 2
                        continue
                    if is_same_player == 1 and share_edge(actual_position, another_position):
                        self.possible_position[state][i][j] = 2
                        continue
                    if self.possible_position[state][i][j] == 0 and is_same_player == 1 and exist_corner(actual_position, another_position):
                        self.possible_position[state][i][j] = 1

    def get_state(self):
        return {
            "is_drop": self.is_drop,
        }
