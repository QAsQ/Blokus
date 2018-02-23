from .initial_pos import piece_initial_pos

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

def piece_shape_set_generate():
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

piece_shape_set = piece_shape_set_generate()

def lower_right_limit_generate():
    pieces = piece_shape_set_generate()
    lower_right_limit = []
    for piece_id in range(21):
        piece_limit = []
        for state in range(8):
            x = 0
            y = 0
            for piece_point in pieces[piece_id][state]:
                x = max(x, piece_point[0])
                y = max(y, piece_point[1])
            piece_limit.append((19-x,19-y))
        lower_right_limit.append(piece_limit)
    return lower_right_limit
