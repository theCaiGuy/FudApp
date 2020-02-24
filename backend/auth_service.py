from flask import Blueprint, current_app, request, jsonify
from flask_httpauth import HTTPBasicAuth
from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)
from itsdangerous import Signer
from passlib.hash import pbkdf2_sha256
import pymongo

auth_service = Blueprint('auth_service', __name__)

auth = HTTPBasicAuth()
client = pymongo.MongoClient("mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority")
db = client.users.users_credentials

@auth_service.route('/api/users/register', methods=['POST'])
def register_auth():
  username = request.json['username']
  password = request.json['password']
  if username is None or password is None:
    return "Please include a username and password", 400
  if db.find_one({"username": username}) is not None:
    return "Cannot overwrite existing user", 400
  new_user = {"username": username}
  new_user["password"] = hash_pwd(password)
  db.insert_one(new_user)
  
  token = get_token_private(username)
  return jsonify({"token": token}, 201)

@auth_service.route('/api/users/login', methods=['POST'])
@auth.login_required
def login_auth():
  username = request.authorization['username']
  password = request.authorization['password']
  if username is None or password is None:
    return "Need username and pwd for token", 401
  token = get_token_private(username)
  return jsonify({"token": token})

@auth_service.route('/api/users/auth_test', methods=['POST'])
@auth.login_required
def get_resource():
  return jsonify({ 'data': 'Auth success' })

@auth.verify_password
def verify_password(username_or_token, password):
  print(request.headers)
  username = verify_auth_token(username_or_token)
  if not username:
    username = username_or_token
    user = db.find_one({"username": username})
    if not user or not verify_pwd(password, user["password"]):
      return False
  return True

def get_token_private(username):
  token = generate_auth_token(username)
  return token.decode('ascii')

def hash_pwd(password):
  return pbkdf2_sha256.hash(password)

def verify_pwd(passwordA, passwordB):
  return pbkdf2_sha256.verify(passwordA, passwordB)

def generate_auth_token(username, expiration = 1000):
  s = Serializer(current_app.config['SECRET_KEY'], expires_in = expiration)
  token = s.dumps({ 'username': username})
  print(token.decode('ascii'))
  return token

def verify_auth_token(token):
  print(token)
  s = Serializer(current_app.config['SECRET_KEY'])
  try:
    data = s.loads(token)
  except SignatureExpired:
    return None
  except BadSignature:
    return None
  return data['username']
  
def get_user_from_request(req):
  if req.authorization['password']:
    print("PASSWD")
    return req.authorization['username']
  return verify_auth_token(req.authorization['username'])

def get_id_from_username(username):
  user = db.find_one({"username": username})
  if user is not None:
    return str(user["_id"])
  else:
    return None

def get_id_from_request(req):
  return get_id_from_username(get_user_from_request(req))