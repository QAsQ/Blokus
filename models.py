from flask_login import UserMixin

class User(UserMixin):
    def __init__(self,id):
        self.id = id;

    def get_id(self):
        return self.id;
    
class Room():
    def __init__(self):
        self.board = list();
        self.state = 0;
    
    def tryin(self,x):
        if (self.state >> x) & 1:
            return False;
        else:
            self.state |= 1 << x;
            return True;
    
    def addChess(self,chs):
        self.board.append(chs);
    
    def start(self,stTime):
        self.lastTime = stTime;
    

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
        if self.getroom(room).tryin(x):
            self.userRoom[userid] = room;
            self.userChair[userid] = x;
            return True;
        else:
            return False;
    
    def setRoom(self,userid,room):
        self.userRoom[userid] = room;
    
    def userInRoom(self,userid,room):
        return userid in self.userRoom and self.userRoom[userid] == room and userid in self.userRoom;





#class Infos():
#    def __init__(self):
#        self.roomInfo = dict();
#        self.boardface = dict();
#        self.userInfo = dict();
#        self.startTim = dict();
#
#    def tryJoinRoom(self,user,room,x):
#        v = self.roomState(room);
#        if (v>>x) & 1:
#            return False;
#        else:
#            self.roomInfo[room] |= 1<<x;
#            self.userInfo[user] = (room, x);
#            return True;
#
#
#    def setRoom(self,user,room):
#        self.userInfo[user] = (room, -1);
#
#    def addSta(self,room,sta):
#        self.boardface[room].append(sta);



def checkUser(name,pw):
    if name == pw:
        return True;
    return False;