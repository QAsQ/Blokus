from battle import Battle
from board import Board, Position, Piece
from data import adhoc_piece_shape_set_generate
import time
import json


def get_timestamp():
    return int(time.time())


def generate_battle():
    timestamp = int(time.time())
    board = Board(adhoc_piece_shape_set_generate())
    battle = Battle(timestamp, board)
    for player_id in range(4):
        assert battle.try_join_player(timestamp, player_id, {"user_id": player_id})
    return battle


def test_user_leave():
    timestamp = get_timestamp()
    board = Board(adhoc_piece_shape_set_generate())
    battle = Battle(timestamp, board)

    assert battle.try_join_player(timestamp, 0, {"user_id": 0})
    assert battle.try_join_player(timestamp, 1, {"user_id": 1})
    assert battle.try_join_player(timestamp, 2, {"user_id": 2})
    battle.remove_player(timestamp, 2)
    assert battle.try_join_player(timestamp, 2, {"user_id": 3})
    assert battle.try_join_player(timestamp, 3, {"user_id": 4})

    assert battle.started


def test_battle_process():
    battle = generate_battle()
    battle.try_drop_piece(get_timestamp(), 0, 0, Position())

    print(json.dumps(battle.get_state(get_timestamp(), 0), indent=4))


def main():
    test_user_leave()
    test_battle_process()

if __name__ == '__main__':
    main()

