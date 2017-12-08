from battle import Battle
from board import Board, Position, Piece
from data import piece_shape_set_generate
import time
import json


def get_timestamp():
    return int(time.time())


def generate_battle():
    timestamp = int(time.time())
    board = Board(piece_shape_set_generate())
    battle = Battle(timestamp, 20, 5, board)
    for player_id in range(4):
        assert battle.try_join_player(timestamp, player_id, {"user_id": player_id})
    return battle


def test_user_leave():
    timestamp = get_timestamp()
    board = Board(piece_shape_set_generate())
    battle = Battle(timestamp, 20, 5, board)

    assert battle.try_join_player(timestamp, 0, {"user_id": 0})
    assert battle.try_join_player(timestamp, 1, {"user_id": 1})
    assert battle.try_join_player(timestamp, 2, {"user_id": 2})
    battle.remove_player(timestamp, 2)
    assert battle.try_join_player(timestamp, 2, {"user_id": 3})
    assert battle.try_join_player(timestamp, 3, {"user_id": 4})
    assert battle.started

def test_battle_process():
    start_timestamp = 1510000000
    board = Board(piece_shape_set_generate())
    battle = Battle(start_timestamp, 5, 2, board)
    for player_id in range(4):
        assert battle.try_join_player(start_timestamp, player_id, {"user_id": player_id})

    assert battle.try_drop_piece(start_timestamp, 0, 0, Position())

    # 0 drop piece
    # 1 lost connect, become auto
    # 1 auto drop piece
    # 2 drop piece 

    #0 lost connect
    #0 auto drop piece
    #1 query for state

    #0, 1, 2 lost connect
    #3 query every 1 second
    #3 get state will see 0, 1, 2 's time run up and auto drop

    #0 drop
    #0, 1, 2, 3 lost connect
    #after long time, 0 query for state

    #0 drop
    #1's time run out
    #1 try drop piece but refuce,1 get newset state(with out auto)



def main():
    test_user_leave()
    test_battle_process()

if __name__ == '__main__':
    main()

