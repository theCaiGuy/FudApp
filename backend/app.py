from flask import Flask
from flask import request, jsonify
app = Flask(__name__)

import auth

import pymongo

client = pymongo.MongoClient("mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority")
db = client.foods.food_data

@app.route('/')
def index():
  return '<h1>Welcome to the Fud Flask API</h1>'


@app.route('/get_food')
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

    # food_cursor = db.find({"food_id" : food_id})
    # return(food_cursor.next()["Food Name"])
