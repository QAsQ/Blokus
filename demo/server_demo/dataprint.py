from data import Point, PieceShape, adhoc_piece_shape_set_generate, lower_right_limit_generate

def pri(matrix):
    for i in range(5):
        for j in range(5):
            print(matrix[i][j],end='')
        print()
    print()

def main():
    Pieces = adhoc_piece_shape_set_generate()
    lower_right_limit = lower_right_limit_generate()
    for piece_id in range(21):
        for state in range(8):
            Position_Matrix = [['.' for j in range(5)] for i in range(5)]
            for point in Pieces[piece_id][state]:
                Position_Matrix[point.x][point.y]='*'
            print(lower_right_limit[piece_id][state].x, ' ', lower_right_limit[piece_id][state].y)
            pri(Position_Matrix)

if __name__ == '__main__':
    main()
