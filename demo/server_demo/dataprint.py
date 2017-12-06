from data import Point, PieceShape

def pri(matrix):
    for i in range(5):
        for j in range(5):
            print(matrix[i][j],end='')
        print()
    print()

def main():
    for Now_Piece in PieceShape:
        Position_Matrix = [['.' for j in range(5)] for i in range(5)]
        for point in Now_Piece:
            Position_Matrix[point.x][point.y]='*'
        pri(Position_Matrix)

if __name__ == '__main__':
    main()