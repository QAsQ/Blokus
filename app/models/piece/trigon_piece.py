class Position:
    def __init__(self, state=-1, x=-1, y=-1, z=-1):
        self.state = state
        self.x = x
        self.y = y
        self.z = z

    @staticmethod
    def from_dict(data):
        ret = Position()
        ret.state = data["state"]
        ret.x = data["x"]
        ret.y = data["y"]
        ret.z = data["z"]
        return ret

    def to_dict(self):
        return {
            "state": self.state,
            "x": self.x,
            "y": self.y,
            "z": self.z
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

class Piece:
    def __init__(self, shape_set, start_point, board_size, initialize_position=None): # todo
        self.shape_set = shape_set
        self.cell_num = 0 if len(shape_set) == 0 else len(shape_set[0])
        self.board_size = board_size
        self.start_point = start_point

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

    def _in_board(self, x, y, z): # 判断三角形是否在棋盘内
        if (z > 1) or (z < 0):
            return False
        if (x > 2 * self.board_size - 1) or (y > 2 * self.board_size - 1):
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
        if 0 > position.state or position.state > 8:
            return False
        if not self._in_board(position.x, position.y, position.z):
            return False

        return self.possible_position[position.state][position.x][position.y][position.z] == can_be_placed

    def get_one_possible_position(self):
        if self.is_drop:
            return Position().to_dict()
        for state in range(8):
            for x, y, z in [(x, y, z) for x in range(2 * self.board_size) for y in range(2 * self.board_size) for z in range(2)]:
                if self.possible_position[state][x][y][z] == 1:
                    return Position(state, x, y).to_dict()
        return Position().to_dict()

    def get_cell_list(self, state):
        return self.shape_set[state]

    def update_possible_position(self, piece_shape, dict_position, is_same_player): # todo
        position = Position.from_dict(dict_position)

        for state in range(8): # todo
            for one_cell in piece_shape:
                for act in self.action[state]:
                    self._update_one_position(
                        state, 
                        one_cell[0] + position.x + act[0],
                        one_cell[1] + position.y + act[1],
                        act[2],
                        is_same_player
                    )
    
    def _update_one_position(self, state, x, y, z, action, is_same_player):
        if not self._in_board(x, y):
            return

        new_state = self.state_update_table[is_same_player][action][self.possible_position[state][x][y][z]]
        self.possible_position[state][x][y][z] = new_state

    def _action_generate(self, piece_shape): # todo
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

    def _generate_piece_initialize_legal_position(self, piece_shape, start_point): # todo

        def can_place(x, y):
            for piece_point in piece_shape:
                if not self._in_board(piece_point[0] + x, piece_point[1] + y):
                    return False
            return True
        
        begin_position = [[0 for y in range(self.board_size)] for x in range(self.board_size)]

        for x, y in [(x, y) for x in range(self.board_size) for y in range(self.board_size)]:
            if not can_place(x, y):
                begin_position[x][y] = illegal
                continue
            state = lack_of_corner
            for point in piece_shape:
                if (x + point[0], y + point[1]) == start_point:
                    state = can_be_placed
                    break
            begin_position[x][y] = state 
        return begin_position

# 输入不合法返回空list
# 输入合法返回合法的相邻三角的list

def edge2edge(pos):
    ret = []
    if not _in_board(pos):
        return ret
    if z == 1:
        tup = (x, y, 0)
        if _in_board(tup):
            ret.append(tup)
        tup = (x, y + 1, 0)
        if _in_board(tup):
            ret.append(tup)
        tup = (x + 1, y, 0)
        if _in_board(tup):
            ret.append(tup)
    else:
        tup = (x, y, 1)
        if _in_board(tup):
            ret.append(tup)
        tup = (x - 1, y, 1)
        if _in_board(tup):
            ret.append(tup)
        tup = (x, y - 1, 1)
        if _in_board(tup):
            ret.append(tup)
    return ret

def corner2corner(pos):
    ret = []
    if not _in_board(pos):
        return ret
    if z == 1:
        tup = (x + 1, y + 1, 0)
        if _in_board(tup):
            ret.append(tup)
        tup = (x + 1, y, 1)
        if _in_board(tup):
            ret.append(tup)
        tup = (x, y + 1, 1)
        if _in_board(tup):
            ret.append(tup)
        tup = (x - 1, y, 1)
        if _in_board(tup):
            ret.append(tup)
        tup = (x - 1, y + 1, 0)
        if _in_board(tup):
            ret.append(tup)
        tup = (x - 1, y + 1, 1)
        if _in_board(tup):
            ret.append(tup)
        tup = (x + 1, y - 1, 0)
        if _in_board(tup):
            ret.append(tup)
        tup = (x + 1, y - 1, 1)
        if _in_board(tup):
            ret.append(tup)
        tup = (x, y - 1, 1)
        if _in_board(tup):
            ret.append(tup)
    else:
        tup = (x - 1, y - 1, 1)
        if _in_board(tup):
            ret.append(tup)
        tup = (x - 1, y, 0)
        if _in_board(tup):
            ret.append(tup)
        tup = (x, y - 1, 0)
        if _in_board(tup):
            ret.append(tup)
        tup = (x , y + 1, 0)
        if _in_board(tup):
            ret.append(tup)
        tup = (x - 1, y + 1, 0)
        if _in_board(tup):
            ret.append(tup)
        tup = (x - 1, y + 1, 1)
        if _in_board(tup):
            ret.append(tup)
        tup = (x + 1, y - 1, 0)
        if _in_board(tup):
            ret.append(tup)
        tup = (x + 1, y - 1, 1)
        if _in_board(tup):
            ret.append(tup)
        tup = (x + 1, y, 0)
        if _in_board(tup):
            ret.append(tup)
    return ret

# 不合法返回(-1, -1, -1)
# 不存在返回(0, 0, 0)
# 合法返回对应位置的tuple

def edge_direct(pos, dir):
    if not _in_board(pos):
        return (-1, -1, -1)
    if z == 1:
        if dir == 0:
            tup = (x, y + 1, 0)
            if _in_board(tup):
                return tup
            else:
                return (0, 0, 0) 
        if dir == 1:
            tup = (x + 1, y, 0)
            if _in_board(tup):
                return tup
            else:
                return (0, 0, 0)
        if dir == 2:
            tup = (x, y, 0)
            if _in_board(tup):
                return tup
            else:
                return (0, 0, 0)
    else:
        if dir == 0:
            tup = (x, y - 1, 0)
            if _in_board(tup):
                return tup
            else:
                return (0, 0, 0) 
        if dir == 1:
            tup = (x - 1, y, 0)
            if _in_board(tup):
                return tup
            else:
                return (0, 0, 0)
        if dir == 2:
            tup = (x, y, 1)
            if _in_board(tup):
                return tup
            else:
                return (0, 0, 0)
        
    
