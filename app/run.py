from models.battle import Battle, BattleFactory
from models.board import BoardFactory
from models.db_utility import init_generate
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
init_generate(db, ["battles", "users"])

@app.route("/")
def index_page():
    return render_template("index.html")

@app.route("/battles")
def battles_page():
    return render_template("battles.html")

@app.route("/rank-list")
def userlist_pate():
    pass

@app.route("/users/<int:user_id>")
def user_page(user_id):
    pass

@app.route("/battle")
def battle_page():
    battle_id = request.args.get('battle_id')
    return render_template("battle.html")

@app.route("/table/<int:table_id>")
def table(table_id):
    pass

@app.route("/api/users", methods=['GET', 'POST'])
def user():
    pass

@app.route("/api/boards/<string:boardType>", methods=['GET'])
def boards(boardType):
    return jsonify(BoardFactory.getBoardData(boardType))


@app.route("/api/battles", methods=['GET', 'POST'])
def battles():
    if request.method == 'GET':
        #need config
        battle_list = []
        #adhoc solve id problem
        for battle in db.battles.find():
            battle.pop("_id")
            battle_list.append(battle)
        return jsonify(battle_list)
    elif request.method == 'POST':
        request_json = request.get_json(force=True)
        succ, battle = BattleFactory.create_battle(
            int(time.time()),
            request_json['battle_info'],
            request_json['board_type'],
            db
        )
        if not succ:
            return jsonify({"message": battle})
        return jsonify({"id": battle.id})

@app.route("/api/battles/<int:battle_id>", methods=['GET', 'POST'])
def battle(battle_id):
    if request.method == 'GET':
        succ, battle = BattleFactory.load_battle(battle_id, db)
        player_id = int(request.args.get('player_id'))
        if not succ:
            return jsonify({"message": battle})
        return jsonify(battle.get_state(int(time.time()), player_id))
    else:
    #POST
        request_json = request.get_json(force=True)
        battle.try_drop_piece(
            int(time.time()), 
            request_json['player_id'],
            request_json['piece_id'],
            request_json['position']
        )
        return jsonify(battle.get_state(int(time.time()), request_json['player_id']))

@app.route("/api/battles/<int:battle_id>/players/<int:player_id>", methods=['PUT'])
def players(battle_id, player_id):
    succ, battle = BattleFactory.load_battle(battle_id, db)
    if not succ:
        return jsonify({"message": battle})

    request_json = request.get_json(force=True)
    user_id = request_json['user_id']
    result = battle.try_join_player(int(time.time()), player_id, user_id)
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)