from data import Point, PieceShape

def pri(matrix):
    for i in range(5):
        for j in range(5):
            print(matrix[i][j],end='')
        print()
    print()

def main():
    for x in PieceShape:
        Position_Matrix = [['.' for j in range(5)] for i in range(5)]
        for P in x:
            Position_Matrix[P.x][P.y]='*'
        pri(Position_Matrix)

if __name__ == '__main__':
    main()