from flask import Blueprint, current_app, request, jsonify
from itsdangerous import (
    TimedJSONWebSignatureSerializer as Serializer,
    BadSignature,
    SignatureExpired,
)
from itsdangerous import Signer
from passlib.hash import pbkdf2_sha256
import pymongo
from bson.objectid import ObjectId

auth_service = Blueprint("auth_service", __name__)

client = pymongo.MongoClient(
    "mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority"
)
db = client.users.users_credentials


"""
Function: register_auth

Registers a new user with the application. If done properly, the user will then be able to sign in
with these same credentials in the future and is supplied with a temporary token for future use.

Arguments:
username (string) : the immutable name the user intends to use for sign-in
password (string) : the password the user intends to use for sign-in
name (string) : the real name the user has
email (string) : the user's email, which can be changed

Returns:
(object) : json containing the token that the user should use for authentication
"""


@auth_service.route("/api/users/register", methods=["POST"])
def register_auth():
    username = request.json.get("username")
    password = request.json.get("password")
    name = request.json.get("name")
    email = request.json.get("email")
    print(username + " is being created")

    # if a parameter isn't present, throw a 400
    if not username:
        return "Please include a username", 400
    if not password:
        return "Please include a password", 400
    if not name:
        return "Please include a name", 400
    if not email:
        return "Please include a email", 400

    # guard against multiple users with one username or email
    if db.find_one({"username": username}) is not None:
        return "Please pick a unique username", 400
    if db.find_one({"email": email}) is not None:
        return "Please pick a unique email", 400

    # create the new user with a hashed password
    new_user = {"username": username, "email": email, "name": name}
    new_user["password"] = hash_pwd(password)
    db.insert_one(new_user)

    # generate a temporary token for the user
    token = get_token_private(username)
    return jsonify({"token": token}), 201


"""
Function: login_auth

Attempts to log in to the given username with the provided password. If successful, the user
will be given a token for further access to the rest of the application.

Arguments:
username (string) : the username the user registered with previously
password (string) : the password associated with the given username

Returns:
(object) : json containing the token that the user should use for authentication
"""


@auth_service.route("/api/users/login", methods=["POST"])
def login_auth():
    # check parameters present
    username = request.authorization.get("username")
    password = request.authorization.get("password")
    if not username or not password:
        return "Need username and password for token", 400

    # if the password is not good for the given user, return unauthorized
    if not verify_password(username, password):
        return "Invalid credentials", 401

    # otherwise, generate a temporary token for the user
    token = get_token_private(username)
    return jsonify({"token": token})


"""
Function: change_name

Changes the name for the currently authenticated user. Returns a successful
empty status code on completion.

Arguments:
name (string) : the new name the user wishes to use
"""


@auth_service.route("/api/users/change_name", methods=["POST"])
def change_name():
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    params = request.json
    if not params or "name" not in params:
        return "Please include a new name", 400
    name = params.get("name")

    db.update_one({"_id": ObjectId(user_id)}, {"$set": {"name": name}})
    return "", 204


"""
Function: change_email

Changes the email for the currently authenticated user. Returns a successful
empty status code on completion.

Arguments:
email (string) : the new email the user wishes to use
"""


@auth_service.route("/api/users/change_email", methods=["POST"])
def change_email():
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    params = request.json
    if not params or "email" not in params:
        return "Please include a new email", 400
    email = params.get("email")

    # if the email is already taken, the user cannot change their email to this
    if db.find_one({"email": email}) is not None:
        return "Please pick a unique email", 400

    db.update_one({"_id": ObjectId(user_id)}, {"$set": {"email": email}})
    return "", 204


"""
Function: change_password

Changes the password for the currently authenticated user. Returns a successful
empty status code on completion.

Arguments:
old_password (string) : the old password that the authenticated user is using
new_password (string) : the new password that the authenticated user wishes to use
"""


@auth_service.route("/api/users/change_password", methods=["POST"])
def change_password():
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    username = get_username_from_request(request)
    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    # check whether the new password is sent first to guard against side channel attacks
    params = request.json
    if "new_password" not in params:
        return "Please include the user's new password", 400
    password = params.get("new_password")
    password_hash = hash_pwd(password)

    # before changing the password, check that the user's old password is correct
    if not params or "old_password" not in params:
        return "Please include the user's old password", 400
    old_password = params.get("old_password")
    if not verify_password(username, old_password):
        return "Incorrect old password supplied", 400

    db.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": password_hash}})
    return "", 204


"""
Function: get_name

Returns the name for the currently authenticated user.

Returns:
(string) : the real name for the authenticated user
"""


@auth_service.route("/api/users/get_name", methods=["POST"])
def get_name():
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    user = get_user_from_request(request)
    if not user:
        return "No user found", 400

    if not user["name"]:
        return "INVALID STATE: user has no name", 400
    return jsonify({"name": user["name"]})


"""
Function: get_email

Returns the email for the currently authenticated user.

Returns:
(string) : the email for the authenticated user
"""


@auth_service.route("/api/users/get_email", methods=["POST"])
def get_email():
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    user = get_user_from_request(request)
    if not user:
        return "No user found", 400

    if not user["email"]:
        return "INVALID STATE: user has no email", 400
    return jsonify({"email": user["email"]})


"""
Function: get_username

Returns the username for the currently authenticated user.

Returns:
(string) : the username for the authenticated user
"""


@auth_service.route("/api/users/get_username", methods=["POST"])
def get_username():
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    user = get_user_from_request(request)
    if not user:
        return "No user found", 400

    if not user["username"]:
        return "INVALID STATE: user has no username", 400
    return jsonify({"username": user["username"]})


"""
Function: verify_credentials

Wrapper method for verify_password to verify that the given username and password or token are valid.
Returns a boolean flag indicating the authentication success.

Arguments:
username (string) : the username of the user or the token of an authenticated user
password (string) ?: the optionally supplied password for the username if a username is sent

Returns:
(bool) : whether or not the supplied credentials are correct and unexpired
"""


def verify_credentials(req):
    username_or_token = req.authorization.get("username")
    password = req.authorization.get("password")
    if not username_or_token:
        return False
    return verify_password(username_or_token, password)


"""
Function: verify_password

Internal method to verify that the given username and password or token are valid. Returns a
boolean flag indicating the authentication success.

Arguments:
username_or_token (string) : the username of the user or the token of an authenticated user
password (string) ?: the optionally supplied password for the username if a username is sent

Returns:
(bool) : whether or not the supplied credentials are correct and unexpired
"""


def verify_password(username_or_token, password):
    if not password:
        return verify_auth_token(username_or_token)
    else:
        user = db.find_one({"username": username_or_token})
        if not user or not verify_pwd(password, user["password"]):
            return False
    return True


"""
Function: verify_auth_token

Internal method to verify that the supplied token is valid.

Arguments:
token (string) : the token of an authenticated user

Returns:
(bool) : whether or not the supplied token is correct and unexpired
"""


def verify_auth_token(token):
    user = decrypt_auth_token(token)
    if not user:
        return False
    else:
        return True


"""
Function: decrypt_auth_token

Given a token, attempts to decrypt it and return the encrypted username inside. If the
token is expired or invalid, returns None.

Arguments:
token (string) : the token of an authenticated user

Returns:
(string) : the username for the token, or None if the token is invalid/expired
"""


def decrypt_auth_token(token):
    s = Serializer(current_app.config["SECRET_KEY"])
    try:
        data = s.loads(token)
    except SignatureExpired:
        return None
    except BadSignature:
        return None
    return data["username"]


"""
Function: get_token_private

Given a user, generates a temporary token for authentication that the user may use.

Arguments:
username (string) : the user for which to generate the token

Returns:
(string) : the token generated for the user in ASCII format
"""


def get_token_private(username):
    token = generate_auth_token(username)
    return token.decode("ascii")


"""
Function: hash_pwd

Hashes the given password and returns the hash for authentication checking.

Arguments:
password (string) : the password to hash

Returns:
(string) : the hashed password
"""


def hash_pwd(password):
    return pbkdf2_sha256.hash(password)


"""
Function: verify_pwd

Checks that the two supplied password hashes are the same password.

Arguments:
passwordA (string) : the first hashed password
passwordB (string) : the second hashed password

Returns:
(bool) : whether or not the two password hashes matched correctly
"""


def verify_pwd(passwordA, passwordB):
    return pbkdf2_sha256.verify(passwordA, passwordB)


"""
Function: generate_auth_token

Generates a new authorized token for the user with the given length.

Arguments:
username (string) : the user for which to generate the token
expiration (int) : how long the token should last before expiration

Returns:
(string) : the token generated for the user
"""


def generate_auth_token(username, expiration=1000):
    s = Serializer(current_app.config["SECRET_KEY"], expires_in=expiration)
    token = s.dumps({"username": username})
    return token


"""
Function: get_username_from_request

Fetches the username from a given request sent to the backend. This method
should only be called after verifying that the supplied authorization credentials
are present and correct, or else an error will be thrown.

Arguments:
req (request) : request object to parse sent to an API route

Returns:
(string) : the username of the user that sent the request
"""


def get_username_from_request(req):
    if req.authorization["password"]:
        return req.authorization["username"]
    return decrypt_auth_token(req.authorization["username"])


"""
Function: get_id_from_username

Fetches the unique user id for a given unique username.

Arguments:
username (string) : the user for which to find the associated user id

Returns:
(string) : the unique database _id of the user that sent the request
"""


def get_id_from_username(username):
    user = db.find_one({"username": username})
    if user and user["_id"]:
        return str(user["_id"])
    else:
        return None


"""
Function: get_id_from_request

Fetches the user id from a given request sent to the backend. This method
should only be called after verifying that the supplied authorization credentials
are present and correct, or else an error will be thrown.

Arguments:
req (request) : request object to parse sent to an API route

Returns:
(string) : the unique database _id of the user that sent the request
"""


def get_id_from_request(req):
    return get_id_from_username(get_username_from_request(req))


"""
Function: get_user_from_request

Fetches the entire user object from a given request sent to the backend. This method
should only be called after verifying that the supplied authorization credentials
are present and correct, or else an error will be thrown.

Arguments:
req (request) : request object to parse sent to an API route

Returns:
(object) : the unique database entry as an object of the user that sent the request
"""


def get_user_from_request(req):
    return db.find_one({"username": get_username_from_request(req)})
