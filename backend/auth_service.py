from flask import Blueprint, current_app, request, jsonify
from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)
from itsdangerous import Signer
from passlib.hash import pbkdf2_sha256
import pymongo

auth_service = Blueprint('auth_service', __name__)

client = pymongo.MongoClient("mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority")
db = client.users.users_credentials

@auth_service.route('/api/users/register', methods=['POST'])
def register_auth():
  username = request.json.get('username')
  password = request.json.get('password')
  print(username + " is being created")
  if not username or not password:
    return "Please include a username and password", 400
  if db.find_one({"username": username}) is not None:
    return "Cannot overwrite existing user", 400
  new_user = {"username": username}
  new_user["password"] = hash_pwd(password)
  db.insert_one(new_user)
  
  token = get_token_private(username)
  return jsonify({"token": token}), 201

@auth_service.route('/api/users/login', methods=['POST'])
def login_auth():
  username = request.authorization.get('username')
  password = request.authorization.get('password')
  if not username or not password:
    return "Need username and password for token", 400
  if not verify_password(username, password):
    return jsonify({"err": "Invalid credentials"}), 401
  token = get_token_private(username)
  return jsonify({"token": token})

@auth_service.route('/api/users/auth_test', methods=['POST'])
def get_resource():
  username_or_token = request.authorization.get('username')
  password = request.authorization.get('password')
  if not username_or_token:
    return jsonify({"err": "Need username or a valid token"}), 401
  elif not verify_password(username_or_token, password):
    return jsonify({"err": "Invalid credentials"}), 401
  return jsonify({ 'data': 'Auth success' })

def verify_credentials(req):
  username_or_token = req.authorization.get('username')
  password = req.authorization.get('password')
  if not username_or_token:
    return False
  return verify_password(username_or_token, password)

def verify_password(username_or_token, password):
  if not password:
    return verify_auth_token(username_or_token)
  else:
    user = db.find_one({"username": username_or_token})
    if not user or not verify_pwd(password, user["password"]):
      return False
  return True

def verify_auth_token(token):
  user = decrypt_auth_token(token)
  if not user:
    return False
  else:
    return True

def decrypt_auth_token(token):
  s = Serializer(current_app.config['SECRET_KEY'])
  try:
    data = s.loads(token)
  except SignatureExpired:
    return None
  except BadSignature:
    return None
  return data['username']

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
  return token
  
def get_user_from_request(req):
  if req.authorization['password']:
    return req.authorization['username']
  return decrypt_auth_token(req.authorization['username'])

def get_id_from_username(username):
  user = db.find_one({"username": username})
  if user and user["_id"]:
    return str(user["_id"])
  else:
    return None

def get_id_from_request(req):
  return get_id_from_username(get_user_from_request(req))