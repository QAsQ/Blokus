class Point:
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y

PieceShape = [
    [Point(0, 0)],
    [Point(0, 0), Point(1, 0)],
    [Point(0, 0), Point(0, 1), Point(1, 0)],
    [Point(0, 0), Point(1, 0), Point(2, 0)],
    [Point(0, 0), Point(0, 1), Point(1, 0), Point(1, 1)],
    [Point(0, 0), Point(0, 1), Point(0, 2), Point(1, 1)],
    [Point(0, 0), Point(0, 1), Point(0, 2), Point(0, 3)],
    [Point(0, 0), Point(1, 0), Point(2, 0), Point(0, 1)],
    [Point(0, 0), Point(0, 1), Point(1, 1), Point(1, 2)],
    [Point(0, 0), Point(0, 1), Point(1, 0), Point(2, 0), Point(3, 0)],
    [Point(0, 0), Point(0, 1), Point(0, 2), Point(1, 1), Point(2, 1)],
    [Point(0, 0), Point(0, 1), Point(0, 2), Point(1, 0), Point(2, 0)],
    [Point(0, 0), Point(1, 0), Point(1, 1), Point(2, 1), Point(3, 1)],
    [Point(0, 0), Point(0, 1), Point(1, 1), Point(2, 1), Point(2, 2)],
    [Point(0, 0), Point(0, 1), Point(0, 2), Point(0, 3), Point(0, 4)],
    [Point(0, 0), Point(0, 1), Point(0, 2), Point(1, 0), Point(1, 1)],
    [Point(0, 0), Point(1, 0), Point(1, 1), Point(2, 1), Point(2, 2)],
    [Point(0, 0), Point(1, 0), Point(2, 0), Point(0, 1), Point(2, 1)],
    [Point(0, 0), Point(0, 1), Point(1, 1), Point(1, 2), Point(2, 1)],
    [Point(1, 0), Point(1, 1), Point(1, 2), Point(0, 1), Point(2, 1)],
    [Point(0, 0), Point(0, 1), Point(0, 2), Point(0, 1), Point(1, 1)]
]

def clockwise90(old_state):
    temp_state = []
    new_state = []
    for point in old_state:
        temp_state.append(Point(4-point.y, point.x))
    x = 5
    y = 5
    for point in temp_state:
        x = min(x, point.x)
        y = min(y, point.y)
    for point in temp_state:
        new_state.append(Point(point.x-x, point.y-y))
    return new_state

def flip(old_state):
    temp_state = []
    new_state = []
    for point in old_state:
        temp_state.append(Point(4-point.x, point.y))
    x = 5
    y = 5
    for point in temp_state:
        x = min(x, point.x)
        y = min(y, point.y)
    for point in temp_state:
        new_state.append(Point(point.x-x, point.y-y))
    return new_state

def piece_shape_set_generate():
    piece_shape_set = []
    for piece_id in range(21):
        piece_state = []
        piece_state.append(PieceShape[piece_id])
        for i in range(3):
            last_state = piece_state[i]
            piece_state.append(clockwise90(last_state))
        before_flip = piece_state[3]
        piece_state.append(flip(before_flip))
        for i in range(3):
            last_state = piece_state[4+i]
            piece_state.append(clockwise90(last_state))
        piece_shape_set.append(piece_state)
    return piece_shape_set

def lower_right_limit_generate():
    pieces = adhoc_piece_shape_set_generate()
    lower_right_limit = []
    for piece_id in range(21):
        piece_limit = []
        for state in range(8):
            x = 0
            y = 0
            for piece_point in pieces[piece_id][state]:
                x = max(x, piece_point.x)
                y = max(y, piece_point.y)
            piece_limit.append(Point(19-x,19-y))
        lower_right_limit.append(piece_limit)
    return lower_right_limit

