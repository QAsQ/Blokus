from flask import Flask, render_template,g,request,redirect
from flask_socketio import SocketIO,send,emit,join_room,leave_room
from flask_login import login_user,logout_user,current_user ,login_required,UserMixin,login_manager,LoginManager

app = Flask(__name__)
socketio = SocketIO(app)

login_manager = LoginManager()
login_manager.init_app(app)

app.secret_key = 'OrzQAQ'
class User(UserMixin):
    def __init__(self,id):
        self.id = id;

    def get_id(self):
        return self.id;


class Rooms():
    def __init__(self):
        self.roomInfo = dict();

    def state(self,room):
        if (room in self.roomInfo) == False:
            self.roomInfo[room] = 0;
        return self.roomInfo[room];

    def tryJoinRoom(self,room,x):
        v = self.state(room);
        if (v>>x) & 1:
            return False;
        else:
            self.roomInfo[room] |= 1<<x;
            return True;

rooms= Rooms();

@login_manager.user_loader
def load_user(userid):
    return  User(userid);

@socketio.on('battle')
def handle_battle(Sta):
    room = current_user.id.split(' ')[0];
    emit('battle',Sta,room = room);

@socketio.on('login')
def login(val):
    room = current_user.id.split(' ')[0];
    join_room(room);
    emit('romsta',{"o":rooms.state(room)},room=room);



@app.route("/<room>/play/<_ind>")
def handle_query(room,_ind):
    ind = int(_ind);
    if rooms.tryJoinRoom(room,ind):
        login_user(User(room+" "+_ind));
        return render_template("playGround.html",play = ind)
    else:
        return redirect("/%s" % (room,));


@app.route("/<room>")
def roomIndex(room):
    return render_template('index.html',sta=str(rooms.state(room)),room=room);

if __name__ == '__main__':
    socketio.run(app,host='0.0.0.0',port=80);
