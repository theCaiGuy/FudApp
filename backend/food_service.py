from flask import Blueprint, request, jsonify
import pymongo

# ML Libraries
import numpy as np
from scipy import spatial

food_service = Blueprint('food_service', __name__)

# Initializes mongo client for whole file to see
client = pymongo.MongoClient("mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority")
db = client.foods.food_data

RESTRICTIONS_MAP = {
    "Vegan" : {"Sausages and Luncheon Meats", "Poultry Products", "Pork Products", "Lamb, Veal, and Game Products", "Finfish and Shellfish Products", "Fats and Oils", "Dairy and Egg Products", "Beef Products"},
    "Vegetarian" : {"Sausages and Luncheon Meats", "Poultry Products", "Pork Products", "Lamb, Veal, and Game Products", "Finfish and Shellfish Products", "Beef Products"},
    "Pescatarian" : {"Sausages and Luncheon Meats", "Poultry Products", "Pork Products", "Lamb, Veal, and Game Products", "Beef Products"},
    "No Red Meat" : {"Sausages and Luncheon Meats", "Lamb, Veal, and Game Products", "Beef Products"},
    "No Pork" : {"Pork Products"},
    "No Beef" : {"Beef Products"},
    "Nut Allergy" : {"Legumes and Legume Products", "Nut and Seed Products"}
}

# Function: get_food()
# Serves up nutrition info on food specified by id
@food_service.route('/api/food/get_food', methods = ["POST"])
def get_food():
    params = request.json
    if not params or "food_id" not in params:
        return "Please include a food id", 400
    food_id = int(params["food_id"])

    results = []

    for food in db.find({"food_id" : food_id}):
        del food["_id"]
        results.append(food)

    return jsonify(results)


#################################################
# Begin: Similarity AI functions

# Function: find_scaled_similarity

# Returns cosine similarity including weights

# Includes additional argument "weights", an array-like that contains weights for the provided
# nutrients

# Reference: https://stackoverflow.com/questions/
# 48581540/how-to-compute-weighted-cosine-similarity-between-two-vectores-in-python

def find_weighted_similarity(food1, food2, weights = None):
    if len(food1) != len(food2):
        return None

    return (1 - spatial.distance.cosine(food1, food2, w = weights))


# Function: get_important_macros:

# Returns list of an food's most important macronutrients

# Arguments:
#     food_dict: Dictionary object retrieved from Mongo for a food's nutrition values
#     nutrients: List of keys of interest -- defaults to [protein, fat, carbs, calories]

def get_important_macros(food_dict, nutrients = ["Protein (g)", "Fat (g)", "Carbohydrates (g)", "Calories"]):
    return [food_dict[nutrient] for nutrient in nutrients]



# Function: findAllSimilarFoods:

# Returns a list of (food, similarity, food group) tibbles of the most similar items
# to a given food

# Arguments:
#    food1: Food of interest

def findAllSimilarFoods(food1):
    similarFoods = []
    for x in db.find():
        otherFood = get_important_macros(x)
        similarity = find_weighted_similarity(food1, otherFood)
        if similarity >= 0.80:
            similarFoods.append((x['food_id'], x['Food Name'], similarity, x["Food Group"], float(x["Calories"])))

    return sorted(similarFoods, key = lambda tup: tup[2], reverse = True)



# Function: get_similar_foods
# Returns info on a few of the most similar foods to that provided by an id
# Arguments:
# food_id: int
# servings: float
# num_foods (optional): How many similar foods you would like returned
@food_service.route('/api/food/get_similar_foods', methods = ["POST"])
def get_similar_foods():
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
        return "Please request 1-14 foods", 400

    # Restrictions in a decent format
    curr_restrictions = set()
    for restriction in request.form:
        curr_groups = RESTRICTIONS_MAP[restriction]
        curr_restrictions = curr_restrictions.union(curr_groups)

    # Finds the nearest foods
    curr_food = db.find_one({"food_id" : food_id})
    if curr_food is None:
        return "Error: improper food id provided"

    num_cals_orig = float(curr_food["Calories"])

    nutritional_atts = get_important_macros(curr_food)
    best_matches = findAllSimilarFoods(nutritional_atts)

    if best_matches is None:
        return "Error: improper food id provided"


    # Loops over food groups
    fg_counter = 0
    fgs = set()
    return_dict = {}
    for next_food in best_matches:
        if next_food[3] in fgs or next_food[0] == food_id or next_food[3] in curr_restrictions:
            continue
        else:
            # Determines new servings for consistent calories
            num_cals = next_food[4]
            if num_cals <= 0:
                new_servings = 1
            else:
                cal_ratio = num_cals_orig / num_cals
                new_servings = cal_ratio * servings

            return_dict[next_food[0]] = new_servings

            fgs.add(next_food[3])
            fg_counter += 1
            if fg_counter >= num_foods:
                break


    # Returns a dict of food_id : servings
    return jsonify(return_dict)
