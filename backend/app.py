import os

from flask import Flask
from flask import request, jsonify

from auth_service import auth_service
from food_service import food_service
from goals_service import goals_service
from plan_service import plan_service
from user_history_service import user_history_service

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(12)

app.register_blueprint(auth_service)
app.register_blueprint(food_service)
app.register_blueprint(goals_service)
app.register_blueprint(plan_service)
app.register_blueprint(user_history_service)

@app.route('/')
def index():
  return '<h1>Welcome to the Fud Flask API</h1>'

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=80)