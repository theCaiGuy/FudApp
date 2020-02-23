from flask import Flask
from flask import request, jsonify
from flask_httpauth import HTTPBasicAuth
import os
app = Flask(__name__)
auth = HTTPBasicAuth()
app.config['SECRET_KEY'] = os.urandom(12)

import auth
import food
import plan
import goals
import user_history

@app.route('/')
def index():
  return '<h1>Welcome to the Fud Flask API</h1>'
  
if __name__ == "__main__":
    app.run(ssl_context='adhoc')