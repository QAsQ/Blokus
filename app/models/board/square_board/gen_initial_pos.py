from .data import piece_shape_set

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

f = open('initial_pos.py', 'w')

piece_pos = []

f.writelines('# player_id(range(4)) & piece_id(range(21)) & piece_state(range(8)) & i(range(20)) & j(range(20))\n')
f.writelines('piece_initial_pos = [')
for player_id in range(4):
    f.write('[')
    for piece_id in range(21):
        f.write('[')
        # TODO should not income player_id
        for state in range(8):
            f.writelines('[')
            ret = generate_piece_initialize_legal_position(
                piece_shape_set[piece_id][state],
                player_id
            )
            for i in range(20):
                f.write('[')
                for j in range(20):
                    f.write(str(ret[i][j]))
                    if j < 19:
                        f.write(', ')
                f.write(']')
                if i < 19:
                    f.write(', ')
                f.write('\n')
            f.write(']')
            if state < 7:
                f.write(', ')
            else:
                f.write('\n')
        f.write(']')
        if piece_id < 20:
            f.write(', ')
        else:
            f.write('\n')
    f.write(']')
    if player_id < 3:
        f.write(', ')
    else:
        f.write('\n')
f.write(']\n')
                
