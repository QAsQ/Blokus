from werkzeug.security import generate_password_hash,check_password_hash
from flask_login import UserMixin

###load user from db 
# have id or username & passwd

### create user to db 
# have username & passwd

### update user info
# from one ended battle
# from one created battle

class User(UserMixin):
    def __init__(self, user_data, db):

        self.username = user_data["username"]
        self.password = user_data['password']
        self.user_id = user_data["user_id"]
        self.user_info = user_data["user_info"]

        self.db = db.users

    def dump(self):
        return {
            "user_id": self.user_id,
            "username": self.username,
            "password": self.password,
            "user_info": self.user_info
        }

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
    def load_from_name(db, username):
        user_data = db.users.find_one({"username": username})
        return User.load(db, user_data)
    
    @staticmethod
    def create(db, id_generate, username, password):
        if db.users.find_one({"username": username}) is not None:
            return False

        user_data = {
            "username": username,
            "password": generate_password_hash(password),
            "user_id": id_generate(db, "users"),
            "user_info": {}
        }

        db.insert(user_data)
        return True

    def check_password(self, password):
        if self.password is None:
            return False
        return check_password_hash(self.password, password)

    def get_id(self):
        return self.user_id