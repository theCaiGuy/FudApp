from flask import Blueprint, request, jsonify
import pymongo

from auth_service import auth, get_id_from_request

goals_service = Blueprint('goals_service', __name__)

client = pymongo.MongoClient("mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority")
db = client.users.users_info


"""
Function: set_user_info

Sets preferences about user in user_info table

Arguments:
user_id (int)

Returns:
"Success" string and code 200 -- indicating the user's info was updated in MongoDB
"""
@goals_service.route('/api/users/goals/set_user_info', methods = ["POST"])
@auth.login_required
def set_user_info():
    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    params = request.json
    if not all(k in params for k in ("age", "height", "weight", "sex", "activity", "goal")):
        return "Please provide an age, height, weight, sex, activity level, and goal.", 400

    # Creates document for DB
    db_post = {
        "user_id" : user_id,
        "age" : int(params["age"]),
        "height_cm" : float(params["height"]),
        "weight_kg" : float(params["weight"]),
        "sex" : params["sex"],
        "activity" : params["activity"],
        "goal" : params["goal"]
    }

    # THIS WILL NEED CHANGING, TODO
    # restrictions = {}
    # for curr_key in request.form:
    #     restrictions[curr_key] = request.form[curr_key]

    # db_post["restrictions"] = restrictions

    # db.insert_one(db_post)
    db.replace_one({"user_id" : user_id}, db_post, upsert = True)

    return "Success", 200


"""
Function: fetch_user_info

Gets preferences about user in user_info table

Arguments:
user_id (int)

Returns:
JSON of user's data straight from MognoDB
"""
@goals_service.route('/api/users/goals/fetch_user_info', methods = ["POST"])
@auth.login_required
def fetch_user_info():
    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    # Gets document from DB
    user_info = db.find_one({"user_id" : user_id})
    del user_info["_id"] # Can't be jsonified -- remove

    return jsonify(user_info), 200


"""
Function: fetch_user_macros

Grabs a user's calculated macronutrients given their info

Arguments:
user_id (int)

Returns:
A Jsonified Dict of user's macros (currently TDEE Calories, Protein, Fat, and Carbs)
"""
@goals_service.route('/api/users/goals/fetch_user_macros', methods = ["POST"])
@auth.login_required
def fetch_user_macros():
    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    user_info = None
    user_info = db.find_one({"user_id" : user_id})

    if user_info is None:
        return "Error: User info not in DB", 400

    # Calculates TDEE
    user_tdee = (10.0 * user_info["weight_kg"] + 6.25 * user_info["height_cm"] - 5.0 * user_info["age"])
    if user_info["sex"] == "M":
        user_tdee += 5.0
    else:
        user_tdee -= 151.0

    user_activity = user_info["activity"]
    if user_activity == "Sedentary":
        user_tdee += 350.0
    elif user_activity == "Light":
        user_tdee += 650.0
    elif user_activity ==  "Moderate":
        user_tdee += 950.0
    elif user_activity == "Heavy":
        user_tdee += 1250.0
    elif user_activity == "Athlete":
        user_tdee += 1600.0

    user_goal = user_info["goal"]
    if user_goal == "Bulk":
        user_tdee += 500
    elif user_goal == "Cut":
        user_tdee -= 500

    # Assuming 30/35/35 protein/fats/carbs ratio in terms of calories
    protein_g = (0.3 * user_tdee) / 4.0
    fat_g = (0.35 * user_tdee) / 9.0
    carbs_g = (0.35 * user_tdee) / 4.0

    return_dict = {
        "tdee" : user_tdee,
        "protein" : protein_g,
        "fat" : fat_g,
        "carbs" : carbs_g
    }
    return jsonify(return_dict), 200
