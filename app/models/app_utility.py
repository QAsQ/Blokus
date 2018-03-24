from itsdangerous import TimedJSONWebSignatureSerializer as Serializer
from flask import jsonify, current_app
import time

def success(result):
    if result == "":
        return jsonify({
            "message": "success"
        })
    else:
        return jsonify({
            "message": "success",
            "result": result
        })

def failure(messsage):
    return jsonify({
        "message": messsage
    })

def field_checker(request_json, fields):
    for field in fields:
        if field not in request_json:
            return "{} field not exist".format(field)
    return None

def current_time():
    return int(time.time())

def require_format(request_args):
    fields = {
        "players_info": str,
        "board_info": int,
        "battle_info": str,
        "chat_logs": int
    }

    require = {}
    for field in fields:
        value = request_args.get(field, type=fields[field], default=None)
        if value is not None:
            require[field] = value
    
    return require

def generate_register_token(email, expiration=3600):
    s = Serializer(current_app.config['SECRET_KEY'], expiration)
    return s.dumps({'email': email}).decode()

def get_email_from_token(token):
    s = Serializer(current_app.config['SECRET_KEY'])
    try:
        data = s.loads(token)
        if 'email' not in data:
            return False
    except:
        return False
    
    return data.get("email")
