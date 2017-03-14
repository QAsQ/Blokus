from flask import Flask, render_template,g,request,redirect
from flask_socketio import SocketIO,send,emit,join_room,leave_room
from flask_login import login_user,logout_user,current_user ,login_required,login_manager,LoginManager
from models import User,checkUser,Infos

app = Flask(__name__)
socketio = SocketIO(app)

login_manager = LoginManager()
login_manager.login_view = "login"
login_manager.init_app(app)

app.secret_key = 'OrzQAQ'

infos = Infos();

@login_manager.user_loader
def load_user(userid):
    return  User(userid);

@socketio.on('battle')
def handle_battle(Sta):
    room = infos.userInfo(current_user.id)[1];
    infos.addSta(room,Sta);
    emit('battle',Sta,room = room);

@socketio.on('loginroom')
def login(val):
    room = infos.userState(current_user.id)[1];
    emit('romsta', {"o":infos.roomState(room)}, room=room);


@socketio.on('wantFace')
def giveFace(use):
    room = infos.userState(current_user.id)[1]
    emit('loadSta', infos.boardface[room]);

@app.route("/index")
def index():
    return render_template('index.html');

@app.route("/login")
def login():
    return render_template("login.html");


@app.route("/room/<room>")
@login_required
def roomIndex(room):
    #print "room is " + room;todo
    infos.setRoom(current_user.id,room);
    print str(infos.userState(current_user.id));
    return render_template('room.html', sta=str(infos.roomState(room)), room=room);

@app.route("/room/<room>/play/<_ind>")
@login_required
def handle_query(room,_ind):
    info = infos.userState(current_user.id);
    ind = int(_ind);
    print str(info);
    if info[0] == True and info[2] != -1:
        return render_template("playGround.html",play = info[2],first="false");

    if infos.tryJoinRoom(current_user.id, room, ind):
        return render_template("playGround.html",play = ind,first="true")
    else:
        return redirect("/%s" % (room,));


if __name__ == '__main__':
    socketio.run(app,host='0.0.0.0',port=80,debug=True);
