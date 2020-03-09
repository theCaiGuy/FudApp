from flask import Blueprint, request, jsonify
import pymongo
import re

# ML Libraries
import numpy as np
from scipy import spatial

from auth_service import verify_credentials, get_id_from_request

food_service = Blueprint("food_service", __name__)

# Initializes mongo client for whole file to see
client = pymongo.MongoClient(
    "mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority"
)
db = client.foods.food_data
user_db = client.users.users_info

# Mapping of our restrictions set to food groups that must not be given
# to a user with that restriction
RESTRICTIONS_MAP = {
    "Vegan": {
        "Sausages and Luncheon Meats",
        "Poultry Products",
        "Pork Products",
        "Lamb, Veal, and Game Products",
        "Finfish and Shellfish Products",
        "Fats and Oils",
        "Dairy and Egg Products",
        "Beef Products",
    },
    "Vegetarian": {
        "Sausages and Luncheon Meats",
        "Poultry Products",
        "Pork Products",
        "Lamb, Veal, and Game Products",
        "Finfish and Shellfish Products",
        "Beef Products",
    },
    "Pescatarian": {
        "Sausages and Luncheon Meats",
        "Poultry Products",
        "Pork Products",
        "Lamb, Veal, and Game Products",
        "Beef Products",
    },
    "No Red Meat": {
        "Sausages and Luncheon Meats",
        "Lamb, Veal, and Game Products",
        "Beef Products",
    },
    "No Pork": {"Pork Products"},
    "No Beef": {"Beef Products"},
    "Nut Allergy": {"Legumes and Legume Products", "Nut and Seed Products"},
}

# Mapping of restrictions to a few key words that may slip
# through the food group situation above -- an example is
# "beef sticks" in the "Snacks" food group
RESTRICTIONS_WORDS = {
    "Vegan" : {"beef", "pork", "sausage", "chicken", "fish", "salmon", "cod", "fat", "tallow", "milk", "cream", "cheese", "turkey", "steak", "meat", "crab", "lobster", "butter"},
    "Vegetarian" : {"beef", "pork", "sausage", "chicken", "fish", "salmon", "cod", "fat", "tallow","turkey", "steak", "meat", "crab", "lobster"},
    "Pescatarian" : {"beef", "pork", "sausage", "chicken", "turkey", "steak", "meat"},
    "No Red Meat" : {"beef", "sausage", "steak", "cow", "veal", "lamb", "venison"},
    "No Pork" : {"pork", "sausage", "pig"},
    "No Beef" : {"beef", "cow", "sasusage"},
    "Nut Allergy" : {"peanut", "seed", "almond", "walnut", "cashew", "pistachio", "pecan", "hazelnut"}
}



"""
Function: get_food()

Serves up nutrition info on food specified by a food_id

Parameters to request:
food_id (int) : food_id for a particular food

Returns:
results (JSON) : Simple dict of the food's attributes straight from MongoDB
"""


@food_service.route("/api/food/get_food", methods=["POST"])
def get_food():
    params = request.json
    if not params or "food_id" not in params:
        return "Please include a food id", 400
    food_id = int(params["food_id"])

    # Returns first food found or none -- should only be 1 per food_id
    food = db.find_one({"food_id": food_id})
    del food["_id"]

    return jsonify(food)


"""
Function: get_foods_keyword_user()

Returns list of foods items (in full) that match a user's keyword search

Parameters:
user_id (int) : Done via UAuth -- ensures search only returns foods out of restrictions!
query (string) : keyword user enters in search, will ignore case here

Returns
results (JSON) : List of food items (which are dicts of food attributes)
"""


@food_service.route("/api/food/get_foods_keyword_user", methods=["POST"])
def get_foods_keyword_user():
    # Handles Auth at the front
    if not verify_credentials(request):
        return jsonify({"err": "Unauthorized: Invalid or missing credentials"}), 401

    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    # Parses arguments
    params = request.json
    if not params or "query" not in params:
        return "Please include a search query", 400

    user_query = str(params["query"])

    # Fetches user restrictions from DB
    user_info = user_db.find_one({"user_id": user_id})
    if not user_info:
        return "No user found in DB", 400

    # Uses set unions to find all of user's restrictions, which will be
    # empty if user has no restrictions
    curr_restrictions = set()
    curr_restricted_words = set()
    user_restrictions = user_info["restrictions"]
    if user_restrictions:
        for restriction in user_restrictions:
            curr_groups = RESTRICTIONS_MAP[restriction]
            curr_restrictions = curr_restrictions.union(curr_groups)

            curr_words = RESTRICTIONS_WORDS[restriction]
            curr_restricted_words = curr_restricted_words.union(curr_words)

    food_regx = re.compile(user_query, re.IGNORECASE)

    return_list = []
    for next_food in db.find({"Food Name": food_regx}):
        if next_food["Food Group"] not in curr_restrictions:
            food_name = next_food["Food Name"].lower()
            restricted_match = False
            for restricted_word in curr_restricted_words:
                if re.search(restricted_word, food_name):
                    restricted_match = True
                    break

            if not restricted_match:
                del next_food["_id"]
                return_list.append(next_food)

    return jsonify(return_list)


#################################################
# Begin: Similarity AI functions

"""
Function: find_weighted_similarity()

Returns cosine similarity including weights.

Includes additional argument "weights",
an array-like that contains weights for the provided nutrients

Parameters:
food1 : Array-like (e.g. list) of desired macronutrients
food2 : Array-like (e.g. list) of desired macronutrients in same order as food1
weights: Array-like (e.g. list) of weighting for each macronutrient

Returns:
similarity (float) : weighted cosine similarity of two foods' macros

Reference: https://stackoverflow.com/questions/48581540/how-to-compute-weighted-cosine-similarity-between-two-vectores-in-python
"""


def find_weighted_similarity(food1, food2, weights=None):
    if len(food1) != len(food2):
        return None

    return 1 - spatial.distance.cosine(food1, food2, w=weights)


"""
Function: get_important_macros()

Returns list of an food's most important macronutrients

Arguments:
food_dict: Dictionary object retrieved from Mongo for a food's nutrition values
nutrients: List of keys of interest -- defaults to [protein, fat, carbs, calories]

Returns:
list of macros for that food specified in the given order to nurtients argument
"""


def get_important_macros(
    food_dict, nutrients=["Protein (g)", "Fat (g)", "Carbohydrates (g)", "Calories"]
):
    return [food_dict[nutrient] for nutrient in nutrients]


"""
Function: findAllSimilarFoods()

Returns a list of (food, similarity, food group) tibbles of the most similar items to a given food

Arguments:
food1: food_id of the original food

Returns:
List of (food_id, food_name, similarity, food_group, calories) tuples in sorted order of Similarity
to the food passed (first food is most similar -- the same food as food1)
"""


def findAllSimilarFoods(food1):
    similarFoods = []
    for x in db.find():
        otherFood = get_important_macros(x)
        similarity = find_weighted_similarity(food1, otherFood)
        if similarity >= 0.80:
            similarFoods.append(
                (x["food_id"], similarity, x["Food Group"], float(x["Calories"]))
            )

    return sorted(similarFoods, key=lambda tup: tup[1], reverse=True)


"""
Function: get_similar_foods_user

Returns info on a few of the most similar foods to that provided by an food_id,
but specific for a given user, so this includes all the AI functionality at the
heart of Fud

Arguments:
user_id : provided via auth
food_id (int) : food_id of food desired for similarity
servings (float) : Used to return how much of new food(s) to maintain caloric count
num_foods (int) : How many similar foods you would like returned (minimum of 3, max of 14)

Returns:
return_dict (JSON) : simple list of food objects (dicts straight from Mongo) with an
additional "Servings" field to match the servings of the food passed.
"""


@food_service.route("/api/food/get_similar_foods_user", methods=["POST"])
def get_similar_foods_user():
    # Handles Auth at the front
    if not verify_credentials(request):
        return "Unauthorized: Invalid or missing credentials", 401

    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400

    # Parses arguments
    params = request.json
    if not params or "food_id" not in params:
        return "Please include a food id", 400
    food_id = int(params["food_id"])

    if not params or "servings" not in params:
        return "Please include the number of servings", 400
    servings = float(params["servings"])

    if not params or "num_foods" not in params:
        return "Please include the number of foods", 400
    num_foods = int(params["num_foods"])
    if num_foods >= 15 or num_foods < 1:
        return "Please request 3-14 foods", 400

    user_info = user_db.find_one({"user_id": user_id})
    if not user_info:
        return "No user found in DB", 400

    # Uses set unions to find all of user's restrictions, which will be
    # empty if user has no restrictions
    curr_restrictions = set()
    curr_restricted_words = set()
    user_restrictions = user_info["restrictions"]
    if user_restrictions:
        for restriction in user_restrictions:
            curr_groups = RESTRICTIONS_MAP[restriction]
            curr_restrictions = curr_restrictions.union(curr_groups)

            curr_words = RESTRICTIONS_WORDS[restriction]
            curr_restricted_words = curr_restricted_words.union(curr_words)

    # Finds the nearest foods using nutrition info
    curr_food = db.find_one({"food_id": food_id})
    if curr_food is None:
        return "Improper food id provided", 400

    num_cals_orig = float(curr_food["Calories"])
    orig_group = curr_food["Food Group"]

    nutritional_atts = get_important_macros(curr_food)
    best_matches = findAllSimilarFoods(nutritional_atts)

    if best_matches is None:
        return "Improper food id provided", 400

    # Loops over food groups -- excludes those in restrictions set
    # Will take at most this many items in same group

    # Default number of foods of same food group as original to return
    num_same_group = 3
    food_counter = 0
    fgs = {orig_group: 0}
    return_list = []
    for next_food in best_matches:
        next_group = next_food[2]
        # If the food group has been seen too many times already, ignore it
        if (
            (
                next_group in fgs
                and (
                    next_group != orig_group
                    or (next_group == orig_group and fgs[next_group] >= num_same_group)
                )
            )
            or next_food[0] == food_id
            or next_group in curr_restrictions
        ):
            continue
        else:
            # Determines new servings for consistent calories
            num_cals = next_food[3]
            new_servings = 1
            if num_cals > 0:
                cal_ratio = num_cals_orig / num_cals
                new_servings = cal_ratio * servings

            full_food = db.find_one({"food_id": next_food[0]})
            if not full_food:
                continue
            del full_food["_id"]
            full_food["Servings"] = new_servings

            # Final parse on food -- make sure obvious false positives
            # do not get through. Because of this, the function may return less
            # than the full amount of foods desired. Uses RegEx
            food_name = full_food["Food Name"].lower()
            restricted_match = False
            for restricted_word in curr_restricted_words:
                if re.search(restricted_word, food_name):
                    restricted_match = True
                    break

            if restricted_match:
                continue


            # Now handles return situation so that we're returning
            # the correct number of foods
            return_list.append(full_food)

            if next_group in fgs:
                fgs[next_group] += 1
            else:
                fgs[next_group] = 1
            food_counter += 1
            if food_counter >= num_foods:
                break


    # Returns a list of food objects with servings as an added field to each
    return jsonify(return_list)
