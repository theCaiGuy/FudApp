from flask import Flask
from flask import request, jsonify
app = Flask(__name__)

import auth
import food
import users
import plan
import goals
import user_history

@app.route('/')
def index():
  return '<h1>Welcome to the Fud Flask API</h1>'
