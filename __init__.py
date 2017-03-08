from flask import Flask, render_template
from flask_socketio import SocketIO,send,emit

app = Flask(__name__)
socketio = SocketIO(app)

@socketio.on('on')
def handle_on(message):
    print(str(message["o"]) + "login");

@socketio.on('battle')
def handle_battle(Sta):
    emit('battle',Sta,broadcast=True);

@app.route('/<ind>')
def index(ind=None):
    return render_template('index.html',player=ind);

if __name__ == '__main__':
    socketio.run(app,host='0.0.0.0',port=80);
