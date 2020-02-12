from app import app
from flask import request, jsonify

@app.route('/login', methods=['GET'])
def login_auth():
  user, pwd = "",""
  results = {"success": True}
  if "username" in request.args:
    user = request.args["username"]
    results["user"] = user
  if "password" in request.args:
    pwd = request.args["password"]
  if pwd != "EEE":
    results["success"] = False
  return jsonify(results)