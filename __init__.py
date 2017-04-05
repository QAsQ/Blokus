from flask import Flask, render_template,g,request,redirect,url_for,jsonify
from flask_socketio import SocketIO,send,emit,join_room,leave_room
from flask_login import login_user,logout_user,current_user ,login_required,login_manager,LoginManager
from sqlalchemy import or_
from models import User,Contest,Infos,db
from threading import Timer
from checker import check,nextSta
import time
import re

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

def updSta(room,Sta):
    infos.room(room).nextTurn(Sta,time.time());
    Sta["remain"] = infos.room(room).remain;
    socketio.emit("move",Sta,room = room);

def setTimer(room):
    Sta = nextSta(infos.room(room).board);
    while infos.room(room).haveNext() and Sta["sta"] == -1:
        updSta(room,Sta);
        Sta = nextSta(infos.room(room).board);
    if infos.room(room).haveNext():
        Timer(infos.room(room).nextTimer(),autoAdd(room,Sta)).start();
    else:
        socketio.emit('gameover',{},room = room);
        with app.app_context():
            infos.clearRoom(room);
        

def autoAdd(room,Sta):
    def Adder():
        if infos.room(room).round() == Sta["round"]:
            nextTurn(room,Sta);
    return Adder;

def nextTurn(room,Sta):
    updSta(room,Sta);
    setTimer(room);

@socketio.on('move')
def handle_battle(Sta):
    room  = infos.user(current_user.id)[0];
    if check(infos.room(room).board,Sta):
        updSta(room,Sta);
        setTimer(room);

@socketio.on("listRoom")
def handle_listroom(var):
    join_room("'list");
    emit("listRoom",infos.listRoom());

@socketio.on('info')
def loginroom(var):
    room = infos.user(current_user.id)[0];
    join_room(room);
    emit('info',infos.room(room).info());

@socketio.on('history')
def history(val):
    room = infos.user(current_user.id)[0];
    #join_room(room); todo
    emit('history',infos.room(room).history(time.time()));

@socketio.on('recorder')
def recorder(val):
    contest = Contest.query.get(val["id"]);
    emit('recorder',{"hist":contest.Record(),"user":contest.player()});
    
@app.route("/user/<username>",methods = ["POST","GET"])
def user(username):
    if request.method == 'POST':
        lists = Contest.query.filter(or_(Contest.play_0 == username \
                                        ,Contest.play_1 == username \
                                        ,Contest.play_2 == username \
                                        ,Contest.play_3 == username)).all();
        lists = map(lambda Obj : Obj.convert(),lists);
        return jsonify(lists);
    return render_template('user.html',name=username);

@app.route("/record/<ind>")
def record(ind):
    if Contest.query.get(ind) is None:
        return "<h1> Contest Doesn't Exist</h1>"
    return render_template('recorder.html',id=ind);


@app.route("/",methods = ['GET','POST'])
@login_required
def index():
    if request.method == 'POST':
        room = request.form.get("room");
        return redirect("/room/%s" % room);
    return render_template('index.html');

@app.route("/room/<room>")
@login_required
def roomIndex(room):
    if room[0] == "'":
        return "<h1>Permission Denied</h1>";
    (lastroom,lastind) = infos.user(current_user.id);
    if lastroom == room and lastind != -1:
        status = 15 - (1 << lastind);
    else:
        status = infos.room(room).status;
    return render_template("room.html",room = room,sta = status);
    
def roomInfoUpdate(room):
    socketio.emit("info",infos.room(room).info(),room = room);
    socketio.emit("listRoom",infos.listRoom(),room = "'list");

def leftRoom(userid):
    (lastroom,lastind) = infos.user(userid);
    if lastroom != "" and lastind != -1:
        infos.room(lastroom).out(lastind);
        infos.userInfo[userid] = ("",-1);
        roomInfoUpdate(lastroom);

@app.route("/room/<room>/play/<_ind>")
@login_required
def joinRoom(room,_ind):
    ind = int(_ind);
    userid = current_user.id;
    if (room,ind) == infos.user(userid): #in this room before
        return render_template("play.html",play = ind);
    leftRoom(userid);
    if infos.join(userid,ind,room):
        roomInfoUpdate(room);
        if infos.room(room).status == 15:
            infos.room(room).start(time.time());
            setTimer(room);
            socketio.emit("startGame",{},room = room);
        return render_template("play.html",play = ind);
    else:
        return render_template("room.html",room = room,sta = infos.room(room).status);


@app.route("/room/<room>/ob")
@login_required
def ob(room):
    leftRoom(current_user.id);
    infos.join(current_user.id,-1,room);
    return render_template("play.html",play = -1);

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
                return redirect(request.args.get('next','/'));
            else:
                return render_template("login.html",message="User not exist or Wrong password!");
        else:
            if re.match(r'^[0-9a-zA-Z]{1,15}$',username) == None:
                return render_template("login.html",message="Invalid username");
            if password != repeat:
                return render_template("login.html",message="Confirm password not same");
            if User.query.filter_by(username=username).first() is not None:
                return render_template("login.html",message="User exist!");
            nuser = User(username,password);
            db.session.add(nuser);
            db.session.commit();
            login_user(nuser);
            return redirect(request.args.get('next','/'));

    if request.method == 'GET':
        return render_template("login.html",message="");

if __name__ == '__main__':
    socketio.run(app,host='0.0.0.0',port=80);

