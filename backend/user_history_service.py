from flask import Blueprint, request, jsonify
import pymongo

from datetime import date

from auth_service import verify_credentials, get_id_from_request

user_history_service = Blueprint('user_history_service', __name__)

client = pymongo.MongoClient("mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority")
db = client.users.users_history

"""
Function: fetch_user_history

Gets history about a user

Arguments:
user_id (int)

Returns:
Jsonified version of user_history dict straight from MongoDB
"""
@user_history_service.route('/api/users/history/fetch_user_history', methods = ["POST"])
def fetch_user_history():
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    # Gets document from DB
    user_info = db.find_one({"user_id" : user_id})
    if user_info:
        del user_info["_id"]
    else:
        return "No user found in DB", 400

    return jsonify(user_info["history"])


"""
Function: fetch_user_history_daily

Gets history about a user for a specific day

Arguments:
user_id (int)
date (str) : Format YYYY-MM-DD

Returns:
Jsonified version of user_history dict straight from MongoDB
"""
@user_history_service.route('/api/users/history/fetch_user_history_daily', methods = ["POST"])
def fetch_user_history_daily():
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    params = request.json
    if not params or "date" not in params:
        return "Please include a date", 400
    curr_date = str(params["date"])

    # Gets document from DB
    user_info = db.find_one({"user_id" : user_id})
    if not user_info:
        return "No user found in DB", 400

    if curr_date not in user_info["history"]:
        return "Date not in user's history", 400

    return jsonify(user_info["history"][curr_date])


"""
Function: set_user_history_food

Sets history about a user -- updating one food at a time

Arguments:
user_id (int)
date (string) : format YYYY-MM-DD for date of item to adjust
meal (string) : string of the meal food is being replaced in
prev_food_id (string) : the id of the food to replace (if not in params, adds new food without replacing anything) -- string for key access in history JSON
food_id (string): the id of the food user just added -- string for key access in history JSON
servings (float) : the number of servings of this food
"""
@user_history_service.route('/api/users/history/set_user_history_food', methods = ["POST"])
def set_user_history_food():
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    params = request.json
    if not params or not all(k in params for k in ("food_id", "date", "meal", "servings")):
        return "Please provide food_id, date, meal, and servings (prev_food_id optional).", 400

    food_id = str(params["food_id"])
    curr_date = str(params["date"])
    curr_meal = str(params["meal"])
    servings = float(params["servings"])

    curr_doc = db.find_one({"user_id" : user_id})

    # This code is complex -- handles missing date, meal name, etc.
    if curr_doc:
        curr_history = curr_doc["history"]
        if curr_date in curr_history:
            if curr_meal in curr_history[curr_date]:
                if "prev_food_id" in params:
                    del curr_history[curr_date][curr_meal][str(params["prev_food_id"])]
                curr_history[curr_date][curr_meal][food_id] = servings
            else:
                curr_history[curr_date][curr_meal] = {food_id : servings}
        else:
            curr_history[curr_date] = {curr_meal : {food_id : servings}}


    else:
        curr_history = {curr_date : {curr_meal : {food_id : servings}}}


    db.replace_one({"user_id" : user_id}, {"user_id" : user_id, "history" : curr_history}, upsert = True)

    return '', 204


"""
Function: set_user_history_meal

Sets history about a user -- updating one meal at a time

Arguments:
user_id (int)
date (string) : format YYYY-MM-DD for date of item to adjust
meal_name (str) : name of the meal (can be used to replace previous same meal)
foods (dict) : maps food_id : servings -- note that food_id's are strings for JSON
"""
@user_history_service.route('/api/users/history/set_user_history_meal', methods = ["POST"])
def set_user_history_meal():
    if not verify_credentials(request):
        return "err": "Unauthorized: Invalid or missing credentials", 401

    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    params = request.json
    if not params or not all(k in params for k in ("date", "meal", "foods")):
        return "Please provide date, meal_name, and foods parameters.", 400

    curr_date = str(params["date"])
    curr_meal = str(params["meal"])
    curr_foods = dict(params["foods"])

    curr_doc = db.find_one({"user_id" : user_id})
    if curr_doc:
        curr_history = curr_doc["history"]
        if curr_date in curr_history:
            curr_history[curr_date][curr_meal] = curr_foods
        else:
            curr_history[curr_date] = {curr_meal : curr_foods}

    else:
        curr_history = {curr_date : {meal_name : curr_foods}}


    db.replace_one({"user_id" : user_id}, {"user_id" : user_id, "history" : curr_history}, upsert = True)

    return '', 204


"""
Function: set_user_history_daily

Sets history about a user -- updating for a full day

Arguments:
user_id (int)
date (str) : string of the date desired, format YYYY-MM-DD
day_history (dict) : Dict that maps food_ids (str) to servings (float) -- string food_ids for JSON
"""
@user_history_service.route('/api/users/history/set_user_history_daily', methods = ["POST"])
def set_user_history_daily():
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    params = request.json

    if not params or "day_history" not in params or "date" not in params:
        return "Please include the daily food history and date", 400
    day_history = dict(params["day_history"])
    curr_date = str(params["date"])


    curr_doc = db.find_one({"user_id" : user_id})

    if curr_doc:
        curr_history = curr_doc["history"]
        curr_history[curr_date] = day_history

    else:
        curr_history = {curr_date : curr_history}

    db.replace_one({"user_id" : user_id}, {"user_id" : user_id, "history" : curr_history}, upsert = True)

    return '', 204


"""
Function: set_user_history_total

Replaces (or creates) history for a user provided a new full history object

Arguments:
user_id (int)
history (dict) : Full history object (see documentation) -- note everything but lowest (serving) level is string for keys
"""
@user_history_service.route('/api/users/history/set_user_history_total', methods = ["POST"])
def set_user_history_total():
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    params = request.json

    if not params or "history" not in params:
        return "Please include the food history", 400
    history = dict(params["history"])

    db.replace_one({"user_id" : user_id}, {"user_id" : user_id, "history" : history}, upsert = True)

    return '', 204
