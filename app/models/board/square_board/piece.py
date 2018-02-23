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

def same_point(point1, point2):
    return point1[0] == point2[0] and point1[1] == point2[1]

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
    def __init__(self, piece_shape_set, player_id, initialize_position=None):
        self.shape_set = piece_shape_set

        self.possible_position = []
        if initialize_position is None:
            for state in range(8):
                self.possible_position.append(
                    self._generate_piece_initialize_legal_position(
                        self.shape_set[state],
                        player_id
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

    def is_possible_position(self, position):
        if 0 > position.state or position.state > 8:
            return False
        if 0 > position.x or 20 < position.x:
            return False
        if 0 > position.y or 20 < position.y:
            return False
        return self.possible_position[position.state][position.x][position.y] == can_be_placed

    def get_one_possible_position(self):
        if self.is_drop:
            return Position()
        for state in range(8):
            for x in range(20):
                for y in range(20):
                    if self.possible_position[state][x][y] == 1:
                        return Position(state, x, y)
        return Position()

    def update_possible_position(self, piece_shape, position, is_same_player):
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
        if x < 0 or x >= 20:
            return
        if y < 0 or y >= 20:
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

    def get_state(self):
        return {
            "is_drop": self.is_drop,
        }


    def _generate_piece_initialize_legal_position(self, piece_shape, player_id):

        def can_place(piece_set, coordinate_x, coordinate_y):
            for piece_point in piece_set:
                if piece_point[0] + coordinate_x >= 20 or piece_point[1] + coordinate_y >= 20:
                    return False
            return True
        
        def occupied(act_pos, ano_pos):
            for actp in act_pos:
                for anop in ano_pos:
                    if same_point(actp, anop):
                        return True
            return False

        def share_edge(act_pos, ano_pos):
            if same_point((act_pos[0] + 1, act_pos[1]), ano_pos):
                return True
            if same_point((act_pos[0] - 1, act_pos[1]), ano_pos):
                return True
            if same_point((act_pos[0], act_pos[1] + 1), ano_pos):
                return True
            if same_point((act_pos[0], act_pos[1] - 1), ano_pos):
                return True
            return False

        def share_corner(act_pos, ano_pos):
            if same_point((act_pos[0] + 1, act_pos[1] + 1), ano_pos):
                return True
            if same_point((act_pos[0] - 1, act_pos[1] - 1), ano_pos):
                return True
            if same_point((act_pos[0] - 1, act_pos[1] + 1), ano_pos):
                return True
            if same_point((act_pos[0] + 1, act_pos[1] - 1), ano_pos):
                return True
            return False

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
                    if same_point((i + point[0] + dir_point[player_id][0], j + point[1] + dir_point[player_id][1]), begin_point[player_id]):
                        can_be_placed = 1
                        break
                begin_position[i][j] = can_be_placed
        return begin_position
