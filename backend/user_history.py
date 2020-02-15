from app import app
from flask import request, jsonify
import pymongo

from datetime import date


client = pymongo.MongoClient("mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority")
db = client.users.users_history

# Function: fetch_user_history
# Gets history about a user

# Arguments: A user_id
@app.route('/history/fetch_user_history', methods = ["GET"])
def fetch_user_history():
    if "user_id" in request.args:
        user_id = int(request.args["user_id"])
    else:
        return "Error: No user id provided."

    # Gets document from DB
    user_info = db.find_one({"user_id" : user_id})
    del user_info["_id"]

    return jsonify(user_info["history"])


# Function: set_user_history
# Gets history about a user

# Arguments: A user_id
@app.route('/history/set_user_history', methods = ["POST"])
def set_user_history():
    if "user_id" in request.args:
        user_id = int(request.args["user_id"])
    else:
        return "Error: No user id provided."

    if "food_id" in request.args:
        food_id = int(request.args["food_id"])
    else:
        return "Error: No food id provided."

    if "servings" in request.args:
        servings = float(request.args["servings"])
    else:
        return "Error: No serving size provided"

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
