from board import Position, Piece
from data import adhoc_piece_shape_set_generate, Point
import time
import json


def test_init():
    piece_shape = [Point(0, 0), Point(0, 1)]
    piece = Piece([piece_shape for _ in range(8)], 0)
    possible_position = [
        Position(0, 0, 0)
    ]
    impossible_position = [
        Position(0, 1, 1)
    ]
    for position in possible_position:
        assert piece.possible_position(possible_position)

    for position in impossible_position:
        assert piece.possible_position(possible_position) == False


def test_update():
#TODO
    pass


def main():
    test_init()
    test_update()
    #TODO

if __name__ == '__main__':
    main()

