from flask import Flask, render_template,redirect
from flask_socketio import SocketIO,send,emit
from flaskext.login import login_user,logout_user,current_user ,login_required

app = Flask(__name__)
socketio = SocketIO(app)

@socketio.on('on')
def handle_on(message):
    print(str(message["o"]) + "login");

@socketio.on('battle')
def handle_battle(Sta):
    emit('battle',Sta,broadcast=True);

@socketio.on('login')
def handle_login(_user):
    if current_user.is_authenticated():
        return redirect(url_for('index'));
    cuser = user(_user["name"]);
    login_user(cuser);

    if cuser and user.is_active() :
        login_user(cuser);
        return  ;

    return  run


@app.route('/')
def index():
    return render_template('index.html',player=ind);


if __name__ == '__main__':
    socketio.run(app,host='0.0.0.0',port=80);
