from werkzeug.security import generate_password_hash,check_password_hash
from flask_login import UserMixin
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer
from flask import current_app
import json

class User(UserMixin):
    def __init__(self, db, user_data):

        self.username = user_data["username"]
        self.email = user_data["email"]
        self.password = user_data['password']
        self.user_id = user_data["user_id"]
        self.confirmed = user_data['confirmed']
        self.user_info = user_data["user_info"]

        self.db = db.users

    def dump(self):
        return {
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "user_info": self.user_info
        }
    
    def generate_confirmation_token(self, expiration=3600):
        s = Serializer(current_app.config['SECRET_KEY'], expiration)
        return s.dumps({'user_id': self.user_id})

    def confirm(self, token):
        s = Serializer(current_app.config['SECRET_KEY'])
        try:
            data = s.loads(token)
            if data.get('user_id') != self.user_id:
                return False
        except:
            return False

        self.confirmed = True
        self.db.update({"user_id": self.user_id}, {"confirmed": True})

    @staticmethod
    def load(db, user_data):
        if user_data is None:
            return None

        return User(db, user_data)

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
            "confirmed": False,
            "user_info": {}
        }

        db.users.insert(user_data)
        return User.load(db, user_data)

    def check_password(self, password):
        if self.password is None:
            return False
        return check_password_hash(self.password, password)

    def get_id(self):
        return self.user_id