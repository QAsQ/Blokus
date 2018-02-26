from models.battle import Battle, BattleFactory
from models.board import BoardFactory
from flask import Flask, render_template, g, request, redirect, url_for, jsonify
from flask_login import LoginManager, current_user, login_user, login_required
from pymongo import MongoClient
from config import db_config
import time
import json
import re

app = Flask(__name__)
db = MongoClient(host=db_config['host'], port=db_config['port'])[db_config['db_name']]
if db_config['username'] is not None and db_config['password'] is not None:
    db.authenticate(db_config['name'], db_config['password'])

@app.route("/index")
def index():
    pass

@app.route("/battle-list")
def battle_list():
    pass

@app.route("/rank-list")
def user_list():
    pass

@app.route("/user/<int:user_id>")
def user(user_id):
    pass

@app.route("/api/boards/<string:boardType>", methods=['GET'])
def boards(boardType):
    return jsonify(BoardFactory.getBoardData(boardType))


@app.route("/api/battles", methods=['GET', 'POST'])
def battles():
    if request.method == 'GET':
        #return battle list
        pass
    elif request.method == 'POST':
        request_json = request.get_json(force=True)
        battle = BattleFactory.create_battle(
            int(time.time()),
            request_json['battle_info'],
            request_json['board_type'],
            db.battles
        )
        return jsonify({"id": battle.id})

@app.route("/api/battles/<int:battle_id>", methods=['GET', 'POST'])
def battle(battle_id):
    if request.method == 'GET':
        battle = BattleFactory.load_battle(battle_id, db.battles)
        player_id = int(request.args.get('player_id'))
        return jsonify(battle.get_state(int(time.time()), player_id))
    else:
    #POST
        request_json = request.get_json()
        battle.try_drop_piece(
            int(time.time()), 
            request_json['player_id'],
            request_json['piece_id'],
            request_json['position']
        )
        return jsonify(battle.get_state(int(time.time()), request_json['player_id']))

@app.route("/api/battles/<int:battle_id>/players/<int:player_id>", methods=['POST'])
@login_required
def players(battle_id, player_id):
    battle = BattleFactory.load_battle(battle_id, db.battles)
    user_id = int(request.args.get('user_id'))
    battle.try_join_player(int(time.time()),player_id, user_id)
    return render_template("Index.html", id=player_id)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)