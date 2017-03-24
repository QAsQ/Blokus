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
        self.status = 0;
        self.remain = [240,240,240,240];
        self.last= -1;
        self.user = [None,None,None,None];
    
    def tryin(self,x,userid):
        if (self.status >> x) & 1:
            return False;
        else:
            self.status |= 1 << x;
            self.user[x] = User.query.get(userid).username;
            return True;

    def out(self,x):
        self.status &= 15 - (1 << x);
        self.user[x] = None;
    
    def info(self):
        return {"status":self.status,"user":self.user};

    def history(self,cur):
        return {"hist":self.board,"remain":self.remain,"cur":cur-self.last};


    def addChess(self,chs):
        self.board.append(chs);
    
    def start(self,stTime):
        print stTime;
        self.last = stTime;
    
    def updateRemain(self,owner,curTime):
        self.remain[owner] -= max(0,curTime-self.last-5);
        self.remain[owner] = max(0,self.remain[owner]);
        self.last = curTime;
        return self.remain[owner];
    

class Infos():
    def __init__(self):
        self.roomInfo = dict();
        self.userInfo = dict(); #(room,index)

    def room(self,room):
        if room not in self.roomInfo:
            self.roomInfo[room] = Room();
        return self.roomInfo[room];

    def user(self,userid):
        if userid not in self.userInfo:
            self.userInfo[userid] = ("",-1);
        return self.userInfo[userid];
    
    def join(self,userid,index,room):
        if self.room(room).tryin(index,userid):
            self.userInfo[userid] = (room,index);
            return True; 
        else:
            return False;

    