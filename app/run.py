from models.battle import Battle
from models.board.board_factory import BoardFactory
from flask import Flask, render_template, g, request, redirect, url_for, jsonify
import time
import json
import re

app = Flask(__name__)

# Test only
timestamp = int(time.time())
current_battle = Battle(timestamp, 1, 1, BoardFactory.createBoard("normal"))
for player_id in range(4):
    assert current_battle.try_join_player(timestamp, player_id, {"user_id": player_id})
# Test only end

@app.route("/boards/<string:boardType>", methods=['GET'])
def boards(boardType):
    return jsonify(BoardFactory.getBoardData(boardType))

@app.route("/battles/<int:battle_id>", methods=['GET', 'POST'])
def battle(battle_id):
    if request.method == 'GET':
        #return jsonify(current_battle.get_state(timestamp + 15, 0))
        player_id = int(request.args.get('player_id'))
        return jsonify(current_battle.get_state(int(time.time()), player_id))
    elif request.method == 'POST':
        request_json = request.get_json()
        print(request_json)
        current_battle.try_drop_piece(
            timestamp, 
            request_json['player_id'],
            request_json['piece_id'],
            request_json['position']
        )
        return jsonify(current_battle.get_state(timestamp, 0))

@app.route("/battles/<int:battle_id>/players/<int:player_id>", methods=['GET'])
def index(battle_id, player_id):
    return render_template("Index.html", id=player_id)


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)



