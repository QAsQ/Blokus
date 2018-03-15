from flask import jsonify
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