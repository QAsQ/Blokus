from flask_login import UserMixin

class User(UserMixin):
    def __init__(self,id):
        self.id = id;

    def get_id(self):
        return self.id;

info = dict();

def checkUser(name,pw):
    if name == pw:
        return True;
    return False;

class Infos():
    def __init__(self):
        self.roomInfo = dict();
        self.boardface = dict();
        self.userInfo = dict();
        self.startTim = dict();

    def roomState(self, room):
        if (room in self.roomInfo) == False:
            self.roomInfo[room] = 0;
            self.boardface[room] = list();
        return self.roomInfo[room];

    def tryJoinRoom(self,user,room,x):
        v = self.roomState(room);
        if (v>>x) & 1:
            return False;
        else:
            self.roomInfo[room] |= 1<<x;
            self.userInfo[user] = (room, x);
            return True;

    def userState(self, userid):
        if not (userid in self.userInfo):
            return (False,-1,-1);
        return (True, self.userInfo[userid][0], self.userInfo[userid][1]);

    def setRoom(self,user,room):
        self.userInfo[user] = (room, -1);

    def addSta(self,room,sta):
        self.boardface[room].append(sta);

