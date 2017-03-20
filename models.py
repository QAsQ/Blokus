from werkzeug.security import generate_password_hash,check_password_hash
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy();

class User(UserMixin,db.Model):
    id = db.Column(db.Integer,primary_key=True)
    username = db.Column(db.String(80),unique=True)
    password = db.Column(db.String(80))

    def __init__(self,username,password):
        self.username = username;
        self.password = generate_password_hash(password);

    def check_password(self,password):
        if self.password is None:
            return False;
        return  check_password_hash(self.password,password);

    def get_id(self):
        return self.id;

class Room():
    def __init__(self):
        self.board = list();
        self.state = 0;
        self.left = [600,600,600,600];
        self.lastTime = -1;
        self.user = [None,None,None,None];
    
    def tryin(self,x,userid):
        if (self.state >> x) & 1:
            return False;
        else:
            self.state |= 1 << x;
            self.user[x] = User.query.get(userid).username;
            return True;
    
    def addChess(self,chs):
        self.board.append(chs);
    
    def start(self,stTime):
        self.lastTime = stTime;
    
    def updLeft(self,owner,curTime):
        self.left[owner] -= max(0,curTime-self.lastTime-10);
        self.left[owner] = max(0,self.left[owner]);
        self.lastTime = curTime;
        return self.left[owner];
    

class Infos():
    def __init__(self):
        self.roomInfo = dict();
        self.userRoom = dict();
        self.userChair = dict();

    def getroom(self,room):
        if not (room in self.roomInfo):
            self.roomInfo[room] = Room();
        return self.roomInfo[room];
    
    def tryInRoom(self,userid,room,x):
        if self.getroom(room).tryin(x,userid):
            self.userRoom[userid] = room;
            self.userChair[userid] = x;
            return True;
        else:
            return False;
    
    def setRoom(self,userid,room):
        self.userRoom[userid] = room;
        if userid in self.userChair:
            self.userChair.pop(userid);
    
    def userInRoom(self,userid,room):
        return userid in self.userRoom and self.userRoom[userid] == room and userid in self.userChair;

