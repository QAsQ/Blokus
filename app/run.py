from models.board import Board
from models.piece import Position
from models.data import piece_shape_set_generate
from models.battle import Battle
from flask import Flask, render_template, g, request, redirect, url_for, jsonify
import time
import json
import re

app = Flask(__name__)

timestamp = int(time.time())
board = Board(piece_shape_set_generate())
current_battle = Battle(timestamp, 20, 0, board)
for player_id in range(4):
    assert current_battle.try_join_player(timestamp, player_id, {"user_id": player_id})


@app.route("/battle/<int:battle_id>/player/<int:player_id>", methods=['GET'])
def index(battle_id, player_id):
    return render_template("Index.html", id=player_id)

@app.route("/v1/battle/<int:battle_id>/player/<int:player_id>", methods=['GET', 'POST'])
def battle(battle_id, player_id):
    if request.method == 'GET':
        #return jsonify(current_battle.get_state(timestamp + 15, 0))
        return jsonify(current_battle.get_state(int(time.time()), 0))
    elif request.method == 'POST':
        request_json = request.get_json()
        current_battle.try_drop_piece(
            timestamp, 
            player_id, 
            request_json['piece_id'],
            Position().from_dict(request_json['position'])
        )
        return jsonify(current_battle.get_state(timestamp, 0))

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)



