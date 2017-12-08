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
        if piece_point[0] + coordinate_x >= 20 or piece_point[1] + coordinate_y >= 20:
            return 0
    return 1


def same_point(point1, point2):
    return point1[0] == point2[0] and point1[1] == point2[1]

# 0-lack of corner
# 1-can be placed
# 2-occupied or share edge with same color or illegal or out of board


def generate_piece_initialize_legal_position(piece_shape, player_id):
    begin_point = [(-1, -1), (20, -1), (20, 20), (-1, 20)]
    dir_point = [(-1, -1), (1, -1), (1, 1), (-1, 1)]
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

# 0 - share_corner
# 1 - share_edge
# 2 - occupy
def action_generate(position):
    dir_point = [(-1, -1), (1, -1), (1, 1), (-1, 1), (-1, 0), (1, 0), (0, 1), (0, -1)]
    result_action = [[[[], [], []] for j in range(20)] for i in range(20)]
    for i in range(20):
        for j in range(20):
            if check_legal_posi(i, j, position) == False:
                continue
            for pos in position:
                now_pos = (pos[0] + i, pos[1] + j)
                for k in range(4):
                    temp_pos = (now_pos[0] + dir_point[k][0], now_pos[1] + dir_point[k][1])
                    if legal(temp_pos):
                        result_action[temp_pos[0]][temp_pos[1]][0].append((i, j))
                for k in range(4, 8):
                    temp_pos = (now_pos[0] + dir_point[k][0], now_pos[1] + dir_point[k][1])
                    if legal(temp_pos):
                        result_action[temp_pos[0]][temp_pos[1]][1].append((i, j))
                result_action[now_pos[0]][now_pos[1]][2].append((i, j))
    return result_action


def occupied(act_pos, ano_pos):
    for actp in act_pos:
        for anop in ano_pos:
            if same_point(actp, anop):
                return 1
    return 0


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
    # for actp in act_pos:
    #     for anop in ano_pos:
    #         if same_point((actp.x + 1, actp.y), anop):
    #             return 1
    #         if same_point((actp.x - 1, actp.y), anop):
    #             return 1
    #         if same_point((actp.x, actp.y + 1), anop):
    #             return 1
    #         if same_point((actp.x, actp.y - 1), anop):
    #             return 1
    # return 0


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
    # dir_point = [(-1, -1), (1, -1), (1, 1), (-1, 1)]
    # for actp in act_pos:
    #     for anop in ano_pos:
    #         for direction in range(4):
    #             if same_point((actp.x + dir_point[direction].x, actp.y + dir_point[direction].y), anop):
    #                 return 1
    # return 0

def legal(posi):
    if posi[0] >= 20 or posi[1] >= 20:
        return False
    else:
        return True

def check_legal_posi(cor_x, cor_y, position):
    for point in position:
        if legal((cor_x + point[0], cor_y + point[1])) == False:
            return False
    return True


class Piece:
    def __init__(self, piece_shape_set, player_id):
        self.shape_set = piece_shape_set
        self.possible_position = []
        self.action = []

        for state in range(8):
            self.possible_position.append(
                generate_piece_initialize_legal_position(
                    self.shape_set[state],
                    player_id
                )
            )
            self.action.append(
                action_generate(
                    self.shape_set[state]
                )
            )
        self.is_drop = False

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
        return self.possible_position[position.state][position.x][position.y] == 1

    def get_one_possible_position(self):
        if self.is_drop:
            return Position()
        for state in range(8):
            for x in range(20):
                for y in range(20):
                    if self.possible_position[state][x][y] == 1:
                        return Position(state, x, y)
        return Position()

    # 0-lack of corner
    # 1-can be placed
    # 2-occupied or share edge with same color or illegal or out of board
    def update_possible_position(self, piece_shape, position, is_same_player):
        for state in range(8):
            for temp_pos in piece_shape:
                pos = (temp_pos[0] + position[0], temp_pos[1] + position[1])
                for act in self.action[state][pos[0]][pos[1]][2]:
                    self.possible_position[state][act[0]][act[1]] = 2
            if is_same_player == True:
                for temp_pos in piece_shape:
                    pos = (temp_pos[0] + position[0], temp_pos[1] + position[1])
                    for act in self.action[state][pos[0]][pos[1]][1]:
                        self.possible_position[state][act[0]][act[1]] = 2
                for temp_pos in piece_shape:
                    pos = (temp_pos[0] + position[0], temp_pos[1] + position[1])
                    for act in self.action[state][pos[0]][pos[1]][0]:
                        if self.possible_position[state][act[0]][act[1]] == 0:
                            self.possible_position[state][act[0]][act[1]] = 1
        # another_position = []
        # for pos in piece_shape:
        #     another_position.append(
        #         (pos.x + position.x, pos.y + position.y))
        # for state in range(8):
        #     for i in range(20):
        #         for j in range(20):
        #             if self.possible_position[state][i][j] == 2:
        #                 continue
        #             actual_position = []
        #             for pos in self.shape_set[state]:
        #                 actual_position.append((pos.x + i, pos.y + j))
        #             if occupied(actual_position, another_position):
        #                 self.possible_position[state][i][j] = 2
        #                 continue
        #             if is_same_player == 1 and share_edge(actual_position, another_position):
        #                 self.possible_position[state][i][j] = 2
        #                 continue
        #             if self.possible_position[state][i][j] == 0 and is_same_player == 1 and exist_corner(actual_position, another_position):
        #                 self.possible_position[state][i][j] = 1

    def get_state(self):
        return {
            "is_drop": self.is_drop,
        }
