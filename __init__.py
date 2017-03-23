from flask import Flask, render_template,g,request,redirect,url_for
from flask_socketio import SocketIO,send,emit,join_room,leave_room
from flask_login import login_user,logout_user,current_user ,login_required,login_manager,LoginManager
from models import User,Infos,db
import time

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///User.db';
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False;
app.secret_key = 'OrzQAQ'

db.init_app(app);

socketio = SocketIO(app)

login_manager = LoginManager()
login_manager.login_view = "login"
login_manager.init_app(app)


infos = Infos();

@login_manager.user_loader
def load_user(id):
    return  User.query.get(id);

@socketio.on('move')
def handle_battle(Sta):
    room = infos.userRoom[current_user.id];
    if(len(infos.getroom(room).board) == 84):
        return;
    tim = time.time();
    infos.getroom(room).addChess(Sta);
    Sta["tim"]=infos.getroom(room).updLeft(int(Sta["o"]),tim);
    emit('move',Sta,room=room);
    if len(infos.getroom(room).board) == 84:
        emit('gameover',{},room=room);#room boom

@socketio.on('loginRoom')
def loginroom(val):
    room = infos.userRoom[current_user.id];
    join_room(room);
    infos.getroom(room).start(time.time());
    emit('info',infos.room(room).info, room=room);


@socketio.on('loadHistory')
@app.route("/index")
def loadHistory():


def index():
    return render_template('index.html');

@app.route("/room/<room>")
@login_required
def roomIndex(room):
    (lastroom,lastind) = infos.user(userid);
    if lastroom == room:
        status = 1 << lastind;
    else:
        status = infos.room(room).sta;
    return render_template("room.html",sta = status);
    

@app.route("/room/<room>/play/<_ind>")
@login_required
def joinRoom(room,_ind):
    ind = int(_ind);
    userid = current_user.id;
    (lastroom,lastind) = infos.user(userid);
    if lastroom == room:
        if infos.room(lastroom).sta == 15:
            return  redirect("/room/%s/play/%d" % (lastroom,lastind));
        else:
            infos.room(lastroom).out(lastind);
            socketio.emit("roomInfo",infos.room(lastroom).info,room = lastroom);
    
    if infos.join(userid,ind,room):
        return render_template("play.html",play = ind,first = "True");
    else:
        return render_template("room.html",sta = infos.room(room).status);


@app.route("/room/<room>/ob")
@login_required
def ob(room):
    return render_template("play.html",play = -1,first="false")

@app.route("/login",methods = ['GET','POST'])
def login():
    if request.method == 'POST':
        username = request.form.get("u");
        password = request.form.get("p");
        repeat = request.form.get("rp","");
        if repeat == "":
            user = User.query.filter_by(username=username).first();
            if user is not None and user.check_password(password):
                login_user(user);
                return redirect(request.args.get('next','index'));
            else:
                return render_template("login.html",message="User not exist or Wrong password!");
        else:
            if password != repeat:
                return render_template("register.html",message="confirm password not same") 
            if User.query.filter_by(username=username).first() is not None:
                return render_template("register.html",message="User exist!");
            if len(username) > 15:
                return render_template("register.html",message="User name too long!");
            nuser = User(username,password);
            db.session.add(nuser);
            db.session.commit();
            login_user(nuser);
            return  redirect("/index");
    if request.method == 'GET':
        return render_template("login.html",message="");

if __name__ == '__main__':
    socketio.run(app,host='0.0.0.0',port=80);

