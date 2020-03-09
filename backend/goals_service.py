from flask import Blueprint, request, jsonify
import pymongo

from auth_service import verify_credentials, get_id_from_request

goals_service = Blueprint("goals_service", __name__)

client = pymongo.MongoClient(
    "mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority"
)
db = client.users.users_info


"""
Function: calculate_tdee_macros

Calculates key macros for a given user

Arguments: A dict (user_info) mapping ->
user_id (int),
measurement_system (string) : One of "Metric" or "Imperial"
height (double) : in cm for Metric, inches for Imperial
weight (double) : in kg fo Metric, lbs for Imperial
sex (string) : "M" or "F" or "NA"
activity (string) : One of "Sedentary", "Light", "Moderate", "Heavy", or "Athlete"
goal (string) : One of "Bulk", "Cut", or "Maintain"
weight_to_change (double) : How many units of weight they want to adjust (positive value)
weeks_to_goal (integer) : How many weeks to accomplish goal (positive value)

Returns: A dict (macros) mapping ->
tdee (double) : tdee Calories
protein (double) : tdee protein (g)
fat (double) : tdee fats (g)
carb (double) : tdee carbs (g)
"""


def calculate_tdee_macros(user_info=None):
    if not user_info:
        return None

    user_system = user_info["measurement_system"]
    user_weight = user_info["weight"]
    user_height = user_info["height"]
    if user_system == "Imperial":
        user_weight *= 0.4536
        user_height *= 2.54

    # Calculates TDEE
    user_tdee = 10.0 * user_weight + 6.25 * user_height - 5.0 * user_info["age"]
    if user_info["sex"] == "M":
        user_tdee += 5.0
    else:
        user_tdee -= 151.0

    user_activity = user_info["activity"]
    if user_activity == "Sedentary":
        user_tdee += 350.0
    elif user_activity == "Light":
        user_tdee += 650.0
    elif user_activity == "Moderate":
        user_tdee += 950.0
    elif user_activity == "Heavy":
        user_tdee += 1250.0
    elif user_activity == "Athlete":
        user_tdee += 1600.0

    user_goal = user_info["goal"]
    user_factor = 0.0  # for maintaining users
    if user_goal == "Bulk":
        user_factor = 1.0
    elif user_goal == "Cut":
        user_factor = -1.0

    # Scales user goal if they're trying to change kg
    if user_system == "Metric":
        user_factor *= 0.454

    # E.g. if 10 lbs in 10 weeks -- 500 calorie change
    user_ratio = 0
    if not user_info["weeks_to_goal"] <= 0:
        user_ratio = (
            user_info["weight_to_change"] / user_info["weeks_to_goal"]
        ) * 500.0

    user_tdee += user_ratio * user_factor

    # Assuming 30/35/35 protein/fats/carbs ratio in terms of calories
    protein_g = (0.3 * user_tdee) / 4.0
    fat_g = (0.35 * user_tdee) / 9.0
    carbs_g = (0.35 * user_tdee) / 4.0

    return_dict = {
        "tdee": user_tdee,
        "protein": protein_g,
        "fat": fat_g,
        "carb": carbs_g,
    }

    return return_dict


"""
Function: set_user_info

Sets preferences about user in user_info table

Arguments (in request body):
user_id (int),
measurement_system (string) : One of "Metric" or "Imperial"
height (double) : in cm for Metric, inches for Imperial
weight (double) : in kg fo Metric, lbs for Imperial
sex (string) : "M" or "F"
activity (string) : One of "Sedentary", "Light", "Moderate", "Heavy", or "Athlete"
goal (string) : One of "Bulk", "Cut", or "Maintain"
weight_to_change (double) : How many units of weight they want to adjust (positive value)
weeks_to_goal (integer) : How many weeks to accomplish goal (positive value)
restrictions: list of restriction strings (e.g. ["Vegan", "Nut Allergy"]) -- empty denotes no restrictions


Returns:
"Success" string -- indicating the user's info was updated in MongoDB
"""


@goals_service.route("/api/users/goals/set_user_info", methods=["POST"])
def set_user_info():
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    params = request.json
    if not all(
        k in params
        for k in (
            "age",
            "height",
            "weight",
            "sex",
            "activity",
            "goal",
            "measurement_system",
            "weight_to_change",
            "weeks_to_goal",
        )
    ):
        return (
            "Please provide an age, height, weight, sex, activity level, goal, measurement_system, weight_to_change, and weeks_to_goal.",
            400,
        )

    # Creates document for DB
    db_post = {
        "user_id": user_id,
        "measurement_system": params["measurement_system"],
        "age": int(params["age"]),
        "height": float(params["height"]),
        "weight": float(params["weight"]),
        "sex": params["sex"],
        "activity": params["activity"],
        "goal": params["goal"],
        "weight_to_change": float(params["weight_to_change"]),
        "weeks_to_goal": float(params["weeks_to_goal"]),
    }

    if "restrictions" in params:
        db_post["restrictions"] = params["restrictions"]
    else:
        db_post["restrictions"] = []

    db.replace_one({"user_id": user_id}, db_post, upsert=True)

    return '', 204


"""
Function: fetch_user_info

Gets preferences about user in user_info table

Arguments:
user_id (int)

Returns:
JSON of user's data straight from MongoDB
"""


@goals_service.route("/api/users/goals/fetch_user_info", methods=["POST"])
def fetch_user_info():
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    # Gets document from DB
    user_info = db.find_one({"user_id": user_id})
    if not user_info:
        return "User not in DB", 400

    del user_info["_id"]  # Can't be jsonified -- remove
    return jsonify(user_info)


"""
Function: fetch_user_macros

Grabs a user's calculated macronutrients given their info

Arguments:
user_id (int)

Returns:
A Jsonified Dict of user's macros (currently TDEE Calories, Protein, Fat, and Carbs)
"""


@goals_service.route("/api/users/goals/fetch_user_macros", methods=["POST"])
def fetch_user_macros():
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    user_info = None
    user_info = db.find_one({"user_id": user_id})

    if user_info is None:
        return "Error: User info not in DB", 400

    return_dict = calculate_tdee_macros(user_info)

    return jsonify(return_dict)
