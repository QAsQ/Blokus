from battle import Battle
from board import Board
from data import adhoc_piece_shape_set_generate
from flask import Flask, render_template, g, request, redirect, url_for, jsonify
from flask_login import login_user, logout_user, current_user, login_required, login_manager, LoginManager
import time
import re

app = Flask(__name__)
timestamp = int(time.time())
board = Board(adhoc_piece_shape_set_generate())
battle = Battle(timestamp, board)


@app.route("/v1/battle/<battle_id>", method=['GET', 'POST'])
def battle(battle_id):
    if request.method == 'GET':
        return jsonify(battle.get_state(timestamp, 0))
    elif request.method == 'POST':
        pass

if __name__ == '__main__':
    app.run()



