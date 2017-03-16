from flask_login import UserMixin

class User(UserMixin):
    def __init__(self,db,id):
        cour = db.cursor();
        cour.execute("select * from user where id= ?",(id,));
        arr = cour.fetchall()[0];
        cour.close();
        print str(arr);
        self.id = arr[0]
        self.name = arr[1];

    def get_id(self):
        return self.id;
    
class Room():
    def __init__(self):
        self.board = list();
        self.state = 0;
        self.left = [1080,1080,1080,1080];
        self.lastTime = -1;
    
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
    
    def updLeft(self,owner,curTime):
        self.left[owner] -= max(0,curTime-self.lastTime-5);
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
        if self.getroom(room).tryin(x):
            self.userRoom[userid] = room;
            self.userChair[userid] = x;
            return True;
        else:
            return False;
    
    def setRoom(self,userid,room):
        self.userRoom[userid] = room;
    
    def userInRoom(self,userid,room):
        return userid in self.userRoom and self.userRoom[userid] == room and userid in self.userChair;


def checkUser(db,name,pw):
    cur = db.cursor();
    cur.execute("select id from user where name = ? and pw = ?", (name,pw));
    id = cur.fetchall();
    cur.close();
    if len(id) == 1:
        return id[0][0];
    return -1;