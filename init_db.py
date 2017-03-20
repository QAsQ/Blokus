from models import db,User
from flask import Flask

app = Flask(__name__);

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///User.db';
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False;

db.app = app;
db.init_app(app);

db.create_all();