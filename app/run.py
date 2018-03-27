import time
import json
import re
import pymongo
from pymongo import MongoClient

from flask import Flask, render_template, g, request, redirect, url_for, jsonify, flash
from flask_login import LoginManager, current_user, login_user, login_required, logout_user

from models.battle import Battle, BattleFactory
from models.board import BoardFactory
from models.user import User
from models.db_utility import init_generate, id_clear, history_clear, id_generate, auth_db, filter_condition_generate, sort_condition_generate, username_checker
from models.app_utility import success, failure, field_checker, current_time, require_format, generate_register_token, get_email_from_token, token_verify
from models.mail_utility import send_register_mail, send_reset_mail, send_confirm_email

from config import db_config, app_config, email_config, url_head


db = MongoClient(host=db_config['host'], port=db_config['port'])[db_config['db_name']]
auth_db(db, db_config)
init_generate(db, ["battles", "users"])

app = Flask(__name__)
app.config['SECRET_KEY'] = app_config['secret_key']

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.anonymous_user = User.anonymous_user(db)

@login_manager.user_loader
def load_user(user_id):
    return User.load_from_id(db, user_id)


@app.route("/")
def index_page():
    return render_template("index.html")

@app.route("/battles")
def battles_page():
    return render_template("battles.html")

@app.route("/about")
def about_page():
    user_number = db.users.find().count()
    battle_number = db.battles.find().count()
    return render_template("about.html", user_number=user_number, battle_number=battle_number)

@app.route("/rank-list")
def userlist_page():
    projection = {"password" : False}
    sort = [("user_info.rating", pymongo.DESCENDING)]
    users = id_clear(db.users.find(
        filter={"user_info.number_of_battles": {"$ne": 0}},
        projection=projection,
        sort=sort))
    return render_template("rank_list.html", users=users)

@app.route("/users")
def user_page():
    try:
        user_id = int(request.args.get("user_id"))
    except:
        return render_template("error.html", message="该用户不存在")

    user = User.load_from_id(db, user_id)
    if user is None:
        return render_template("error.html", message="该用户不存在")

    return render_template("user.html", target_user=user)

@app.route("/user_setting")
def user_setting_page():
    try:
        user_id = int(request.args.get("user_id"))
    except:
        return render_template("error.html", message="该用户不存在")
    user = User.load_from_id(db, user_id)
    if user is None:
        return render_template("error.html", message="该用户不存在")
    if user.user_id != current_user.user_id:
        return render_template("error.html", message="没有权限")

    return render_template("user_setting.html", target_user=user, updated=False)

@app.route("/register")
def regiester_page():
    try:
        token = request.args.get("token")
        email = get_email_from_token(token)
        if email == False:
            return render_template("error.html", message="没有权限")
        if not token_verify(db, token):
            return render_template("error.html", message="网址已过期")
    except Exception:
        return render_template("error.html", message="没有权限")
    
    return render_template("register.html", email=email, token=token)

@app.route("/confirm")
def confirm_page():
    try:
        token = request.args.get("token")
        email = get_email_from_token(token)
        if email == False or current_user.user_id == -1:
            return render_template("error.html", message="没有权限")
        if not token_verify(db, token):
            return render_template("error.html", message="网址已过期")
    except Exception:
            return render_template("error.html", message="没有权限")
    
    current_user.update("email", email)
    
    return render_template("user_setting.html", target_user=current_user, updated=True)

@app.route("/password_resetter")
def password_resetter_page():
    try:
        token = request.args.get("token")
        email = get_email_from_token(token)
        user = User.load_from_email(db, email)
        if email == False:
            return render_template("error.html", message="没有权限")
        if not token_verify(db, token):
            return render_template("error.html", message="网址已过期")
    except Exception:
        return render_template("error.html", message="没有权限")
    
    return render_template("password_resetter.html", token=token, user_id=user.user_id)


@app.route("/battle")
def battle_page():
    try:
        battle_id = int(request.args.get('battle_id'))
    except Exception as e:
        return render_template("error.html", message=repr(e))
    
    battle = BattleFactory.load_battle(battle_id, db)

    if isinstance(battle, str):
        return render_template("error.html", message=battle)

    return render_template("battle.html", battle=battle.get_state(current_time(), current_user.user_id))

@app.route("/api/register", methods=['POST'])
def regiester():
    request_json = request.get_json(force=True)

    check_res = field_checker(request_json, ['email'])
    if check_res is not None:
        return failure(check_res)

    result = send_register_mail(
        request_json['email'], 
        url_head + "/register?token=" + generate_register_token(request_json['email']), 
        email_config
    )

    if result != "success":
        return failure(result)
    return success("")

@app.route("/api/password_resetter", methods=['POST'])
def password_resetter():
    request_json = request.get_json(force=True)

    check_res = field_checker(request_json, ['email'])
    if check_res is not None:
        return failure(check_res)

    result = send_reset_mail(
        request_json['email'], 
        url_head + "/password_resetter?token=" + generate_register_token(request_json['email']), 
        email_config
    )

    if result != "success":
        return failure(result)
    return success("")

@app.route("/api/confirm", methods=['POST'])
def confirm():
    request_json = request.get_json(force=True)
    check_res = field_checker(request_json, ['email', 'password'])
    if check_res is not None:
        return failure(check_res)
    if not current_user.check_password(request_json['password']):
        return failure("原密码错误")

    result = send_confirm_email(
        current_user.username,
        request_json['email'], 
        url_head + "/confirm?token=" + generate_register_token(request_json['email']), 
        email_config
    )

    if result != "success":
        return failure(result)
    return success("")

@app.route("/api/users", methods=['GET', 'POST'])
def users():
    if request.method == 'GET':
        try:
            query = json.loads(request.args.get("query", ""))
            sort = json.loads(request.args.get("sort", "[]"))
        except Exception as e:
            return failure(repr(e))

        #remove password
        projection = {"password" : False}
        return success(id_clear(db.users.find(
            filter=query,
            projection=projection,
            sort=sort)))

    elif request.method == 'POST':
        request_json = request.get_json(force=True)

        check_res = field_checker(request_json, ['username', 'email', 'password', 'token'])
        if check_res is not None:
            return failure(check_res)
        
        try:
            assert(get_email_from_token(request_json['token']) == request_json['email'])
        except Exception as e:
            return failure("Permission Denied")

        user = User.create(
            db, 
            id_generate, 
            request_json['username'], 
            request_json['email'], 
            request_json['password']
        )
        if isinstance(user, str):
            return failure(user)
        login_user(user)

        return success(user.dump())

@app.route("/api/users/<int:user_id>", methods=['PUT'])
def user(user_id):
    if current_user.user_id == -1 or current_user.user_id != user_id:
        return failure("perission denied")
    request_json = request.get_json(force=True)

    check_res = field_checker(request_json, ['old_password'])
    if check_res is not None:
        return failure(check_res)
    
    if not current_user.check_password(request_json['old_password']):
        return failure("原密码错误")
    
    legal_field = ['username', 'password']
    for key in list(request_json):
        if key not in legal_field:
            request_json.pop(key)

    for key in request_json:
        current_user.update(key, request_json[key])
    
    return success(current_user.dump())

@app.route("/api/users/<int:user_id>/email_password_resetter", methods=['PUT'])
def user_email_password_resetter(user_id):
    request_json = request.get_json(force=True)

    check_res = field_checker(request_json, ['token', 'password'])
    if check_res is not None:
        return failure(check_res)
    try:
        token = request_json["token"]
        email = get_email_from_token(token)
        user = User.load_from_email(db, email)
        if email == False:
            return failure("Permission denied")
    except Exception:
        return failure("Permission denied")
    
    user.update('password', request_json['password'])
    login_user(user)
    
    return success("")

@app.route("/api/users/online", methods=['POST', 'DELETE'])
def login():
    if request.method == 'POST':
        request_json = request.get_json(force=True)
        user = User.load_from_email(db, request_json['email'])

        if user is None:
            return failure("user not exist")
        if not user.check_password(request_json['password']):
            return failure("password not correct")

        login_user(user)

        return success(user.dump())

    elif request.method == 'DELETE':
        logout_user()

        return success(current_user.dump())
        
@app.route("/api/boards/<string:boardType>", methods=['GET'])
def boards(boardType):
    return success(BoardFactory.getBoardData(boardType))

@app.route("/api/battles", methods=['GET', 'POST'])
def battles():
    if request.method == 'GET':
        try:
            query = json.loads(request.args.get("query", "{}"))
            sort = json.loads(request.args.get("sort", "[]"))
            start = json.loads(request.args.get('start', "{'start': 0}"))['start']
            limit = json.loads(request.args.get('limit', "{'limit': 30}"))['limit']
        except:
            return failure("request syntax error! need json string!")

        if "username" in query and not username_checker(db, query['username']):
            return failure("user not exist")
        
        mongo_query = filter_condition_generate(query)
        if isinstance(query, str):
            return failure(query)

        mongo_sort = sort_condition_generate(sort)
        if isinstance(sort, str):
            return failure(sort)
        
        current_user.update_perference(
            "condition", 
            {"query": query, "sort": sort}
        )
        
        # return success(id_clear(db.battles.find(
        #     filter=mongo_query,
        #     sort=mongo_sort)))
        return success({
            "start": start,
            "battle_list": history_clear(db.battles.find(
            filter=mongo_query,
            sort=mongo_sort)[start : start + limit])})

    elif request.method == 'POST':
        if current_user.user_id == -1:
            return failure("need login first!")

        request_json = request.get_json(force=True)
        check_res = field_checker(request_json, [
            'battle_name', 
            'accuracy_time', 
            'additional_time', 
            'board_type'])
        if check_res is not None:
            return failure(check_res)

        battle = BattleFactory.create_battle(
            current_time(),
            request_json,
            request_json['board_type'],
            db
        )

        if isinstance(battle, str):
            return failure(battle) 

        current_user.update_perference("create", request_json)

        return success({"id": battle.id})

@app.route("/api/battles/<int:battle_id>", methods=['GET', 'POST'])
def battle(battle_id):
    battle = BattleFactory.load_battle(battle_id, db)
    user_id = current_user.user_id

    if isinstance(battle, str):
        return failure(battle)

    if request.method == 'GET':
        require = require_format(request.args)
        return success(battle.get_state(current_time(), user_id, require))


    elif request.method == 'POST':
        #todo check user_id match player_id
        request_json = request.get_json(force=True)

        check_res = field_checker(request_json, ['player_id', 'piece_id', 'position'])
        if check_res is not None:
            return failure(check_res)

        battle.try_drop_piece(
            current_time(), 
            request_json['player_id'],
            current_user.user_id,
            request_json['piece_id'],
            request_json['position']
        )
        return success(battle.get_state(current_time(), request_json['player_id']))

@app.route("/api/battles/<int:battle_id>/chat_logs", methods=['POST'])
def chat_logs(battle_id):
    if current_user.user_id == -1:
        return failure("need login first!")

    request_json = request.get_json(force=True)
    check_res = field_checker(request_json, ['content'])
    if check_res is not None:
        return failure(check_res)

    battle = BattleFactory.load_battle(battle_id, db)
    if isinstance(battle, str):
        return failure(battle)
    
    require = request_json.get("require", {})
    result = battle.append_chat_log(
        current_time(),
        current_user.username,
        request_json['content'],
        require=require
    )
    if isinstance(result, str):
        return failure(result)
    
    return success(result)

@app.route("/api/battles/<int:battle_id>/players/<int:player_id>", methods=['POST', 'DELETE'])
def players(battle_id, player_id):
    if current_user.user_id == -1:
        return failure("need login first!")

    battle = BattleFactory.load_battle(battle_id, db)
    if isinstance(battle, str):
        return failure(battle)

    if request.method == 'POST':
        result = battle.try_join_player(current_time(), player_id, current_user.user_id, current_user.dump())
        if (isinstance(result, str)):
            return failure(result)
        
        return success(result)
    
    elif request.method == 'DELETE':
        result = battle.try_remove_player(current_time(), player_id, current_user.user_id)
        if (isinstance(result, str)):
            return failure(result)
        
        return success(result)


@app.route("/api/battles/<int:battle_id>/players/<int:player_id>/hosting", methods=['POST', 'DELETE'])
def hosting(battle_id, player_id):
    battle = BattleFactory.load_battle(battle_id, db)
    if isinstance(battle, str):
        return failure(battle)

    user_id = current_user.user_id
    if user_id == -1:
        return failure("请先登录!")

    if request.method == 'POST':
        result = battle.add_hosting(current_time(), player_id, current_user.user_id)
        if (isinstance(result, str)):
            return failure(result)
        
        return success(result)

    elif request.method == 'DELETE':
        result = battle.remove_hosting(current_time(), player_id, current_user.user_id)
        if (isinstance(result, str)):
            return failure(result)
        
        return success(result)

if __name__ == '__main__':
    #app.run(host='0.0.0.0', port=80, debug=True)
    app.run(host='0.0.0.0', debug=True)
