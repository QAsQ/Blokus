#this code need to be fix
from .square_piece import Position

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

class Piece:
    def __init__(self, shape_set, start_point, board_size, initialize_position=None):
        self.shape_set = shape_set
        self.cell_num = 0 if len(shape_set) == 0 else len(shape_set[0])
        self.board_size = board_size
        self.start_point = start_point

        self.possible_position = []
        if initialize_position is None:
            for state in range(12):
                self.possible_position.append(
                    self._generate_piece_initialize_legal_position(
                        self.shape_set[state],
                        start_point
                    )
                )
        else:
            self.possible_position = initialize_position

        self.action = []
        for state in range(12):
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

    def _in_board(self, x, y, z=None): # 判断三角形是否在棋盘内
        if (x > 2 * self.board_size - 1) or (y > 2 * self.board_size - 1):
            return False
        if z is None:
            return True

        if (z > 1) or (z < 0):
            return False
        if z == 1:
            if (x + y < self.board_size - 1) or (x + y > 3 * self.board_size - 2):
                return False
        else:
            if (x + y < self.board_size) or (x + y > 3 * self.board_size - 1):
                return False
        return True

    def try_drop(self, position):
        if self.is_drop:
            return False
        if not self.is_possible_position(position):
            return False
        self.is_drop = True
        return True

    def is_possible_position(self, dict_position):
        position = Position.from_dict(dict_position)
        if 0 > position.state or position.state > 11:
            return False
        if not self._in_board(position.x, position.y):
            return False

        return self.possible_position[position.state][position.x][position.y] == can_be_placed

    def get_one_possible_position(self):
        if self.is_drop:
            return Position().to_dict()
        for state in range(12):
            for x, y in [(x, y) for x in range(2 * self.board_size) for y in range(2 * self.board_size)]:
                if self.possible_position[state][x][y] == can_be_placed:
                    return Position(state, x, y).to_dict()
        return Position().to_dict()

    def get_cell_list(self, state):
        return self.shape_set[state]

    def update_possible_position(self, piece_shape, dict_position, is_same_player):
        position = Position.from_dict(dict_position)

        for state in range(12):
            for one_cell in piece_shape:
                for act in self.action[state][one_cell[2]]:
                    self._update_one_position(
                        state, 
                        one_cell[0] + position.x + act[0],
                        one_cell[1] + position.y + act[1],
                        act[2],
                        is_same_player
                    )
    
    def _update_one_position(self, state, x, y, action, is_same_player):
        if not self._in_board(x, y):
            return

        new_state = self.state_update_table[is_same_player][action][self.possible_position[state][x][y]]
        self.possible_position[state][x][y] = new_state

    def _action_generate(self, piece_shape):
        irrelevant = -1
        def get_act(x, y, z, ano_pos):
            ano_pos = (ano_pos[0] + x, ano_pos[1] + y, ano_pos[2])
            x = y = 0
            dist = abs(ano_pos[0]) + abs(ano_pos[1])
            same_direction = ano_pos[2] == z
            if dist == 0:
                return occupy if same_direction else share_edge
            if dist == 1 and same_direction:
                return share_corner
            if (x + 1, y - 1) ==  ano_pos[:2] or (x - 1, y + 1) == ano_pos[:2]:
                return share_corner
            step = -1 if z == 0 else 1
            if (x + step, y) == ano_pos[:2] or (x, y + step) == ano_pos[:2]:
                return share_edge
            if (x + step, y + step, 1 - z) == ano_pos:
                return share_corner
            return irrelevant

        res_action = [[], []]
        for z in range(2):
            for x, y in [(x, y) for x in range(-4, 4) for y in range(-4, 4)]:
                action = irrelevant
                for ano_pos in piece_shape:
                    action = max(action, get_act(x, y, z, ano_pos))
                    if action == occupy:
                        break
                if action == irrelevant:
                    continue
                res_action[z].append((x, y, action))
        return res_action

    def _generate_piece_initialize_legal_position(self, piece_shape, start_point):

        def can_place(x, y):
            for piece_point in piece_shape:
                if not self._in_board(piece_point[0] + x, piece_point[1] + y, piece_point[2]):
                    return False
            return True
        
        begin_position = [[[] for x in range(2 * self.board_size)] for y in range(2 * self.board_size)]

        for x, y in [(x, y) for x in range(2 * self.board_size) for y in range(2 * self.board_size)]:
            if not can_place(x, y):
                begin_position[x][y] = illegal
                continue
            state = lack_of_corner
            for point in piece_shape:
                if (x + point[0], y + point[1], point[2]) == start_point:
                    state = can_be_placed
                    break
            begin_position[x][y] = state 
        return begin_position

PieceShape = [
    [],
    [[2, 1, 0]],
    [[0, 2], [1], [2, 1]],
    [[2, 1, 2, 0, 2]]
]

def piece_shape_set_generate():

    def generate_shape(raw_data):
        def next_cell(pos, direct):
            direction = [
                [(0, -1), (-1, 0), (0, 0)],
                [(0, 1), (1, 0), (0, 0)]
            ]
            dx, dy = direction[pos[2]][direct]
            return [pos[0] + dx, pos[1] + dy, 1 - pos[2]]
        
        def generate_cell_list(start, path):
            cell_list = [start]
            for direct in path:
                cell_list.append(next_cell(cell_list[-1], direct))
            return cell_list[1:]
        
        def shift(cell_list):
            x = 0
            y = 0
            for cell in cell_list:
                x = min(x, cell[0])
                y = min(y, cell[1])
            new_cell = []
            for cell in cell_list:
                new_cell.append((cell[0] - x, cell[1] - y, cell[2]))
            return new_cell

        start = [0, 0, raw_data[0]]
        initial_shape = [start]
        for path_list in raw_data[1:]:
            initial_shape = initial_shape + generate_cell_list(start, path_list)
        return shift(initial_shape)
    
    def update_path(raw_data, state):
        full_mapping = [
            ((0, 1, 2), 0),#0
            ((0, 2, 1), 1),#1
            ((1, 2, 0), 1),#2
            ((2, 1, 0), 0),#3
            ((2, 0, 1), 0),#4
            ((1, 0, 2), 1),#5
            ((0, 1, 2), 1),#6
            ((0, 2, 1), 0),#7
            ((1, 2, 0), 0),#8
            ((2, 1, 0), 1),#9
            ((2, 0, 1), 1),#10
            ((1, 0, 2), 0) #11
        ]
        mapping, start = full_mapping[state]
        path = [start]
        for raw_path in raw_data:
            path.append(list(map(lambda dir: mapping[dir], raw_path)))
        return path

    piece_shape_set = []
    for raw_data in PieceShape:
        piece_shape = []
        for state in range(12):
            piece_shape.append(generate_shape(update_path(raw_data, state)))

        piece_shape_set.append(piece_shape)

    return piece_shape_set
