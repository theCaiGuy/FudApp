from flask import Blueprint, request, jsonify
import pymongo

from datetime import date

from auth_service import auth, get_id_from_request

user_history_service = Blueprint('user_history_service', __name__)

client = pymongo.MongoClient("mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority")
db = client.users.users_history

# Function: fetch_user_history
# Gets history about a user

# Arguments: A user_id
@user_history_service.route('/api/users/history/fetch_user_history', methods = ["POST"])
@auth.login_required
def fetch_user_history():
    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    # Gets document from DB
    user_info = db.find_one({"user_id" : user_id})
    del user_info["_id"]

    return jsonify(user_info["history"])


# Function: set_user_history
# Gets history about a user

# Arguments: A user_id, food_id, servings
@user_history_service.route('/api/users/history/set_user_history', methods = ["POST"])
@auth.login_required
def set_user_history():
    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    params = request.json
    if not params or "food_id" not in params:
        return "Please include a food id", 400
    food_id = int(params["food_id"])

    if not params or "servings" not in params:
        return "Please include the number of servings", 400
    servings = float(params["servings"])

    curr_date = str(date.today())
    curr_doc = db.find_one({"user_id" : user_id})
    curr_history = curr_doc["history"]

    if curr_date in curr_history:
        if str(food_id) in curr_history[curr_date]:
            curr_history[curr_date][str(food_id)] += servings
        else:
            curr_history[curr_date][str(food_id)] = servings
    else:
        curr_history[curr_date] = {str(food_id) : servings}

    db.replace_one({"user_id" : user_id}, {"user_id" : user_id, "history" : curr_history}, upsert = True)

    return "Success"
