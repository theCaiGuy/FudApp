from app import app
from flask import request, jsonify
import pymongo


client = pymongo.MongoClient("mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority")
db = client.users.users_info

# Function: get_user_macros
# Returns a Jsonified list of user daily goals [Calories, ]

# Arguments: A user_id
@app.route('/get_user_macros')
def get_user_macros():
    if "user_id" in request.args:
        user_id = int(request.args["user_id"])
    else:
        return "Error: No user id provided."

    user_info = None
    user_info = db.find_one({"user_id" : user_id})

    if user_info is None:
        return "Error: User not in DB"

    user_tdee = (10.0 * user_info["weight_kg"] + 6.25 * user_info["height_cm"] - 5.0 * user_info["age"])
    if user_info["sex"] == "M":
        user_tdee += 5.0
    else:
        user_tdee -= 151.0

    user_activity = user_info["activity"]
    if user_activity == "Sedentary":
        user_tdee += 350.0
    elif user_activity == "Light Exercise":
        user_tdee += 650.0
    elif user_activity ==  "Moderate Exericse":
        user_tdee += 950.0
    elif user_activity == "Heavy Exercise":
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

    return_list = [user_tdee, protein_g, fat_g, carbs_g]
    return jsonify(return_list)
