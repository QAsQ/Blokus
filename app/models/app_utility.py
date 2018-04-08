import time
from functools import wraps

from flask import current_app, g, jsonify, redirect, request, url_for
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer


def field_checker_json(check_list, method=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if method == request.method or method is None:
                request_json = request.get_json(force=True)
                check_res = field_checker(request_json, check_list)
                if check_res is not None:
                    return failure(check_res)
            return f(*args, **kwargs)
        return decorated_function
    return decorator


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


def token_verify(db, token):
    if list(db.token.find({"token": token})) == []:
        db.token.insert({"token": token})
        return True
    return False
