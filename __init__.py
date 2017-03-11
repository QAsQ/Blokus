from flask import Flask, render_template,g,request,redirect
from flask_socketio import SocketIO,send,emit
#from flaskext.lon import lon_user,lout_user,current_user ,lon_required

app = Flask(__name__)
socketio = SocketIO(app)
class roomState:
    def __init__(self):
        self.v = 0;

    def tryin(self,x):
        if (self.v>>x) & 1:
            return False;
        else:
            self.v |= 1<<x;
            print self.v;
            return True;

rom = roomState();

@socketio.on('battle')
def handle_battle(Sta):
    emit('battle',Sta,broadcast=True);

@socketio.on('login')
def login(ver):
    emit('romsta',{"o":rom.v},broadcast=True);



@app.route("/ask/<ind>")
def handle_query(ind):
    id = int(ind);
    print ind;
    if rom.tryin(id):
        return render_template("playGround.html",play = id)
    else:
        return redirect("/home");

@app.route("/home")
def index():
    return render_template('index.html',sta=rom.v);


if __name__ == '__main__':
    socketio.run(app,host='0.0.0.0',port=80,debug=True);
