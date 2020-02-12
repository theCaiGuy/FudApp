from flask import Flask
app = Flask(__name__)

import auth

@app.route('/')
def index():
  return '<h1>Welcome to the Fud Flask API</h1>'
