from werkzeug.security import generate_password_hash,check_password_hash
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
import json

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
    

class Contest(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    play_0 = db.Column(db.Integer)
    play_1 = db.Column(db.Integer)
    play_2 = db.Column(db.Integer)
    play_3 = db.Column(db.Integer)
    record = db.Column(db.String)

    def __init__(self,players,_record):
        (play0,play1,play2,play3) = players;
        self.play_0 = play0;
        self.play_1 = play1;
        self.play_2 = play2;
        self.play_3 = play3;
        self.record = json.dumps(_record);
    
    def Record(self):
        return json.loads(self.record);
    
    def player(self):
        return (self.play_0,self.play_1,self.play_2,self.play_3);

    def convert(self):
        return {"id":self.id,"user":(self.play_0,self.play_1,self.play_2,self.play_3)}
    

class Room():
    def __init__(self):
        self.board = list();
        self.status = 0;
        self.remain = [240,240,240,240];
        self.last= -1;
        self.user = [None,None,None,None];
        self.userid = [None,None,None,None];
    
    def tryin(self,x,userid):
        if (self.status >> x) & 1:
            return False;
        else:
            self.status |= 1 << x;
            self.user[x] = User.query.get(userid).username;
            self.userid[x] = userid;
            return True;

    def out(self,x):
        self.status &= 15 - (1 << x);
        self.user[x] = None;
        self.userid[x] = None;
    
    def info(self):
        return {"status":self.status,"user":self.user};
    
    def round(self):
        return len(self.board);

    def history(self,cur):
        return {"hist":self.board,"remain":self.remain,"cur":cur-self.last};
    
    def start(self,stTime):
        self.last = stTime;
    
    def nextTurn(self,chs,curTime):
        owner = self.round() % 4;
        self.remain[owner] -= max(0,curTime-self.last-5);
        self.remain[owner] = max(0,self.remain[owner]);
        self.board.append(chs);
        self.last = curTime;
    
    def toContest(self):
        return Contest(self.user,self.board);
    
    def nextTimer(self):
        return self.remain[self.round() % 4] + 5;
  
    def haveNext(self):
        return self.round() < 84;
    
    def deadline(self,curTime):
        return self.last != -1 and curTime < self.last + self.remain[self.round() % 4];
        

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
        if index < 0 or self.room(room).tryin(index,userid):
            self.userInfo[userid] = (room,index);
            return True; 
        else:
            return False;

    def clearRoom(self,room):
        db.session.add(self.room(room).toContest());
        db.session.commit();
        for id in self.room(room).userid:
            self.userInfo[id] = ("",-1);
        self.roomInfo.pop(room);
    
    def listRoom(self):
        rooms = list();
        for room in self.roomInfo:
            if self.roomInfo[room].status != 0:
                rooms.append((room,self.roomInfo[room].user));
        return rooms;
