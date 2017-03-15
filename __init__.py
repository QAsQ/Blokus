from flask import Flask, render_template,g,request,redirect,url_for
from flask_socketio import SocketIO,send,emit,join_room,leave_room
from flask_login import login_user,logout_user,current_user ,login_required,login_manager,LoginManager
from models import User,checkUser,Infos
import time

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
    room = infos.userRoom[current_user.id];
    if(len(infos.getroom(room).board) == 84):
        return;
    tim = time.time();
    infos.getroom(room).addChess(Sta);
    Sta["tim"]=tim;
    print str(Sta)
    emit('battle',Sta,room=room);
    if len(infos.getroom(room).board) == 84:
        emit('gameover',{},room=room);

@socketio.on('loginRoom')
def login(val):
    room = infos.userRoom[current_user.id];
    join_room(room);
    stTim = time.time();
    print "room = " + str(infos.getroom(room));
    print "sta = " + str(infos.getroom(room).state);
    emit('romsta', {"o":infos.getroom(room).state,"time":stTim}, room=room);
    if infos.getroom(room).state == 15:
        infos.getroom(room).start(time.time());


@socketio.on('wantFace')
def giveFace(use):
    room = infos.userRoom[current_user.id];
    join_room(room);
    emit('loadSta', infos.getroom(room).board);

@app.route("/index")
def index():
    return render_template('index.html');

@app.route("/login",methods = ['GET','POST'])
def login():
    username = request.form.get("u","");
    password = request.form.get("p","");
    if username != "" and password != "" and checkUser(username,password):
        user = User(username);
        login_user(user);
        return redirect(request.args.get('next','index'));
    else:
        return render_template("login.html");

@app.route("/register",methods = ['GET','POST'])
def register():
    username = request.form.get("u","");
    password = request.form.get("p","");
    cpassword = request.form.get("cp","");
    if username == "" or password == "":
        return render_template("register.html")

    return render_template("index.html");

@app.route("/room/<room>")
@login_required
def roomIndex(room):
    infos.setRoom(current_user.id,room);
    return render_template('room.html', sta=infos.getroom(room).state, room=room);

@app.route("/room/<room>/play/<_ind>")
@login_required
def handle_query(room,_ind):
    ind = int(_ind);
    if infos.userInRoom(current_user.id,room):
        return render_template("playGround.html"
                              ,play = infos.userChair[current_user.id]
                              ,first="false");

    if infos.tryInRoom(current_user.id, room, ind):
        return render_template("playGround.html",play = ind,first="true")
    else:
        return redirect("/room/%s" % (room,));


if __name__ == '__main__':
    socketio.run(app,host='0.0.0.0',port=80);
