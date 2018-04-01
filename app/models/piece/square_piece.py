class Position:
    def __init__(self, state=-1, x=-1, y=-1):
        self.state = state
        self.x = x
        self.y = y

    @staticmethod
    def from_dict(data):
        ret = Position()
        ret.state = data["state"]
        ret.x = data["x"]
        ret.y = data["y"]
        return ret

    def to_dict(self):
        return {
            "state": self.state,
            "x": self.x,
            "y": self.y
        }

# 0-lack of corner
# 1-can be placed
# 2-occupied or share edge with same color or illegal or out of board
lack_of_corner = 0
can_be_placed = 1
illegal = 2

# 0 - share_corner
# 1 - share_edge
# 2 - occupy
share_corner = 0
share_edge = 1
occupy = 2

# 维护单个棋子(包括八个状态）在棋盘的各个位置上的状态
class Piece:
    def __init__(self, shape_set, start_point, board_size, initialize_position=None):
        self.shape_set = shape_set
        self.cell_num = 0 if len(shape_set) == 0 else len(shape_set[0])
        self.board_size = board_size

        self.possible_position = []
        if initialize_position is None:
            for state in range(8):
                self.possible_position.append(
                    self._generate_piece_initialize_legal_position(
                        self.shape_set[state],
                        start_point
                    )
                )
        else:
            self.possible_position = initialize_position

        self.action = []
        for state in range(8):
            self.action.append(
                self._action_generate(
                    self.shape_set[state]
                )
            )
        self.is_drop = False

        self.state_update_table = [
            [[0, 1, 2],
             [0, 1, 2],
             [2, 2, 2]],

            [[1, 1, 2],
             [2, 2, 2],
             [2, 2, 2]]
        ]

    def try_drop(self, position):
        if self.is_drop:
            return False
        if not self.is_possible_position(position):
            return False
        self.is_drop = True
        return True

    def is_possible_position(self, dict_position):
        position = Position.from_dict(dict_position)
        if 0 > position.state or position.state > 8:
            return False
        if 0 > position.x or self.board_size < position.x:
            return False
        if 0 > position.y or self.board_size < position.y:
            return False
        return self.possible_position[position.state][position.x][position.y] == can_be_placed

    def get_one_possible_position(self):
        if self.is_drop:
            return Position()
        for state in range(8):
            for x, y in [(x, y) for x in range(self.board_size) for y in range(self.board_size)]:
                if self.possible_position[state][x][y] == 1:
                    return Position(state, x, y)
        return Position()
    
    def get_cell_list(self, state):
        return self.shape_set[state]

    def update_possible_position(self, piece_shape, dict_position, is_same_player):
        position = Position.from_dict(dict_position)

        for state in range(8):
            for one_cell in piece_shape:
                for act in self.action[state]:
                    self._update_one_position(
                        state, 
                        one_cell[0] + position.x + act[0],
                        one_cell[1] + position.y + act[1],
                        act[2],
                        is_same_player
                    )
    
    def _update_one_position(self, state, x, y, action, is_same_player):
        if x < 0 or x >= self.board_size:
            return
        if y < 0 or y >= self.board_size:
            return
        self.possible_position[state][x][y] = self.state_update_table[is_same_player][action][self.possible_position[state][x][y]]

    def _action_generate(self, piece_shape):
        irrelevant = -1
        def get_act(x, y, ano_pos):
            dx = abs(x + ano_pos[0])
            dy = abs(y + ano_pos[1])
            if dx + dy == 0:
                return occupy
            if dx <= 1 and dy <= 1:
                if dx + dy == 2:
                    return share_corner
                else:
                    return share_edge
            return irrelevant

        res_action = []
        for x in range(-5, 6):
            for y in range(-5, 6):
                action = irrelevant
                for ano_pos in piece_shape:
                    action = max(action, get_act(x, y, ano_pos))
                    if action == occupy:
                        break
                if action == irrelevant:
                    continue
                res_action.append((x, y, action))
        return res_action

    def _generate_piece_initialize_legal_position(self, piece_shape, player_id):

        def can_place(piece_set, coordinate_x, coordinate_y):
            for piece_point in piece_set:
                if piece_point[0] + coordinate_x >= 20 or piece_point[1] + coordinate_y >= 20:
                    return False
            return True
        
        begin_point = [(-1, -1), (-1, 20), (20, 20), (20, -1)]
        dir_point = [(-1, -1), (-1, 1), (1, 1), (1, -1)]
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
                    if (i + point[0] + dir_point[player_id][0], 
                        j + point[1] + dir_point[player_id][1]) == begin_point[player_id]:
                        can_be_placed = 1
                        break
                begin_position[i][j] = can_be_placed
        return begin_position

PieceShape = [
    [(0, 0)],
    [(0, 0), (1, 0)],
    [(0, 0), (0, 1), (1, 0)],
    [(0, 0), (1, 0), (2, 0)],
    [(0, 0), (0, 1), (1, 0), (1, 1)],
    [(0, 0), (0, 1), (0, 2), (1, 1)],
    [(0, 0), (0, 1), (0, 2), (0, 3)],
    [(0, 0), (1, 0), (2, 0), (0, 1)],
    [(0, 0), (0, 1), (1, 1), (1, 2)],
    [(0, 0), (0, 1), (1, 0), (2, 0), (3, 0)],
    [(0, 0), (0, 1), (0, 2), (1, 1), (2, 1)],
    [(0, 0), (0, 1), (0, 2), (1, 0), (2, 0)],
    [(0, 0), (1, 0), (1, 1), (2, 1), (3, 1)],
    [(0, 0), (0, 1), (1, 1), (2, 1), (2, 2)],
    [(0, 0), (0, 1), (0, 2), (0, 3), (0, 4)],
    [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1)],
    [(0, 0), (1, 0), (1, 1), (2, 1), (2, 2)],
    [(0, 0), (1, 0), (2, 0), (0, 1), (2, 1)],
    [(0, 0), (0, 1), (1, 1), (1, 2), (2, 1)],
    [(1, 0), (1, 1), (1, 2), (0, 1), (2, 1)],
    [(0, 0), (0, 1), (0, 2), (0, 3), (1, 1)]
]

def piece_shape_set_generate():
    def clockwise90(old_state, clock):
        temp_state = []
        new_state = []
        for point in old_state:
            if clock:
                temp_state.append((4 - point[1], point[0]))
            else:
                temp_state.append((point[1], 4 - point[0]))
        x, y = 5, 5
        for point in temp_state:
            x = min(x, point[0])
            y = min(y, point[1])
        for point in temp_state:
            new_state.append((point[0]-x, point[1]-y))
        return new_state

    def flip(old_state):
        temp_state = []
        new_state = []
        for point in old_state:
            temp_state.append((point[0], 4 - point[1]))
        x, y = 5, 5
        for point in temp_state:
            x = min(x, point[0])
            y = min(y, point[1])
        for point in temp_state:
            new_state.append((point[0]-x, point[1]-y))
        return new_state

    piece_shape_set = []
    for piece_id in range(21):
        piece_shape = []
        for i in range(8):
            if i == 0:
                piece_shape.append(PieceShape[piece_id])
            elif i % 2:
                piece_shape.append(flip(piece_shape[i-1]))
            else:
                piece_shape.append(clockwise90(piece_shape[i-2], False))
        piece_shape_set.append(piece_shape)
    return piece_shape_set
