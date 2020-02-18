from app import app
from flask import request, jsonify
import pymongo

# ML Libraries
import numpy as np
from scipy import spatial

# Initializes mongo client for whole file to see
client = pymongo.MongoClient("mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority")
db = client.foods.food_data

# Function: get_food()
# Serves up nutrition info on food specified by id
@app.route('/food/get_food', methods = ["GET"])
def get_food():
    if "food_id" in request.args:
        food_id = int(request.args["food_id"])
    else:
        return "Error: No food id provided."

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
            similarFoods.append((x['food_id'], x['Food Name'], similarity, x["Food Group"]))

    return sorted(similarFoods, key = lambda tup: tup[2], reverse = True)



# Function: get_similar_food
# Returns info on a few of the most similar foods to that provided by an id
@app.route('/food/get_similar_food', methods = ["GET"])
def get_similar_food():
    if "food_id" in request.args:
        food_id = int(request.args["food_id"])
    else:
        return "Error: No food id provided."

    best_matches = None
    for curr_food in db.find({"food_id" : food_id}):
        nutritional_atts = get_important_macros(curr_food)
        best_matches = findAllSimilarFoods(nutritional_atts)

    if best_matches is None:
        return "Error: improper food id provided"

    # Returns 2nd-4th best matches, as 1st best is the original!
    return jsonify(best_matches[1:5])
