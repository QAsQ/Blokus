from werkzeug.security import generate_password_hash,check_password_hash
from flask_login import UserMixin
from flask import current_app
import json

default_info = {
    "number_of_battles": 0,
    "number_of_victory": 0,
    "rate_of_victory": 0,
    "rating": 1500,
    "perference":{
        "condition": {
            "sort" : ["d:initiation_time"],
            "query" : {
                "username": "",
                "battle_state": [],
                "battle_name": "",
                "board_type": []
            }
        },
        "create": {
            'battle_name': "Blokus_GO!",
            'accuracy_time': 180, 
            'additional_time': 5, 
            'board_type': "square_standard"
        }
    }
}

class User(UserMixin):
    def __init__(self, db, user_data):

        self.user_id = user_data["user_id"]
        self.username = user_data["username"]
        self.email = user_data["email"]
        self.password = user_data['password']
        self.user_info = user_data["user_info"]

        self.db = db.users

    def dump(self, with_password=False):
        dict_data = {
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "user_info": self.user_info
        }

        if with_password:
            dict_data["password"] = self.password

        return dict_data
    
    def update_battle_result(self, victory, rating):
        self.user_info['rating'] = rating
        self.user_info['number_of_battles'] += 1
        if (victory):
            self.user_info["number_of_victory"] += 1
        self.user_info["rate_of_victory"] = self.user_info["number_of_victory"] * 1.0 / self.user_info['number_of_battles']
        self.db.update(
            {"user_id": self.user_id}, 
            {"$set": {"user_info": self.user_info}}
        )

    def update_perference(self, field, preference):
        if self.user_id != -1:
            self.user_info["perference"][field] = preference
            self.db.update(
                {"user_id": self.user_id}, 
                {
                    "$set": {
                        "user_info.perference": self.user_info["perference"]
                    }
                }
            )

    def update(self, key, value):
        if key == "password":
            value = generate_password_hash(value)
        
        self.__setattr__(key, value)

        self.db.update(
            {"user_id": self.user_id}, 
            {"$set": {key: value}}
        )

    def check_password(self, password):
        if self.password is None:
            return False
        return check_password_hash(self.password, password)

    def get_id(self):
        return self.user_id

    @staticmethod
    def load(db, user_data):
        if user_data is None:
            return None

        return User(db, user_data)

    @staticmethod
    def anonymous_user(db):
        def generater():
            return User.load(db, {
                "user_id": -1,
                "username": "not login",
                "email": "anonymous@blokus.io",
                "password": "",
                "user_info": default_info
            })
        
        return generater

    @staticmethod
    def load_from_id(db, user_id):
        user_data = db.users.find_one({"user_id": user_id})
        return User.load(db, user_data)
    
    @staticmethod
    def load_from_email(db, email):
        user_data = db.users.find_one({"email": email})
        return User.load(db, user_data)
    
    @staticmethod
    def create(db, id_generate, username, email, password):
        if db.users.find_one({"username": username}) is not None:
            return "username used"

        if db.users.find_one({"email": email}) is not None:
            return "email used"

        user_data = {
            "username": username,
            "email": email,
            "password": generate_password_hash(password),
            "user_id": id_generate(db, "users"),
            "user_info": default_info
        }

        db.users.insert(user_data)
        return User.load(db, user_data)