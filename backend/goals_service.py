from flask import Blueprint, request, jsonify
import pymongo

goals_service = Blueprint('goals_service', __name__)

client = pymongo.MongoClient("mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority")
db = client.users.users_info


# Function: set_user_info
# Sets preferences about user in user_info table

# Arguments: A user_id
@goals_service.route('/goals/set_user_info', methods = ["POST"])
def set_user_info():
    if not all(k in request.args for k in ("user_id", "age", "height", "weight", "sex", "activity", "goal")):
        return "Error: Bad Request, missing fields. Please provide a user_id, age, height, weight, sex, activity level, and goal."

    user_id = int(request.args["user_id"])
    # Creates document for DB
    db_post = {
        "user_id" : user_id,
        "age" : int(request.args["age"]),
        "height_cm" : float(request.args["height"]),
        "weight_kg" : float(request.args["weight"]),
        "sex" : request.args["sex"],
        "activity" : request.args["activity"],
        "goal" : request.args["goal"]
    }

    restrictions = {}
    for curr_key in request.form:
        restrictions[curr_key] = request.form[curr_key]

    db_post["restrictions"] = restrictions

    # db.insert_one(db_post)
    db.replace_one({"user_id" : user_id}, db_post, upsert = True)

    return "Success"


# Function: fetch_user_info
# Gets preferences about user in user_info table

# Arguments: A user_id
@goals_service.route('/goals/fetch_user_info', methods = ["GET"])
def fetch_user_info():
    if "user_id" in request.args:
        user_id = int(request.args["user_id"])
    else:
        return "Error: No user id provided."

    # Gets document from DB
    user_info = db.find_one({"user_id" : user_id})
    del user_info["_id"]

    return jsonify(user_info)



# Function: fetch_user_macros
# Returns a Jsonified list of user daily goals [Calories, ]

# Arguments: A user_id
@goals_service.route('/goals/fetch_user_macros', methods = ["GET"])
def fetch_user_macros():
    if "user_id" in request.args:
        user_id = int(request.args["user_id"])
    else:
        return "Error: No user id provided."

    user_info = None
    user_info = db.find_one({"user_id" : user_id})

    if user_info is None:
        return "Error: User not in DB"

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
    return jsonify(return_dict)
