from app import app
from flask import request, jsonify
import pymongo

# Function: get_daily_plan
# Returns a daily_plan object to front end
@app.route('/get_daily_meals')
def get_daily_meals():
    # Hard-coded example: replace with daily plan generator
    EXAMPLE_PLAN = {
        "Breakfast" : [
            {
                "Food Name" : "Eggs",
                "Calories" : 100,
                "Protein (g)" : 10,
                "Fat (g)" : 9,
                "Carbs (g)" : 0.4,
                "Servings" : 2.0
            },
            {
                "Food Name" : "Toast",
                "Calories" : 100,
                "Protein (g)" : 1,
                "Fat (g)" : 1,
                "Carbs (g)" : 15,
                "Servings" : 2.0
            }
        ],
        "Lunch" : [
            {
                "Food Name" : "Turkey Patty",
                "Calories" : 200,
                "Protein (g)" : 30,
                "Fat (g)" : 3,
                "Carbs (g)" : 3,
                "Servings" : 2.0
            },
            {
                "Food Name" : "Burger Bun",
                "Calories" : 200,
                "Protein (g)" : 4,
                "Fat (g)" : 2,
                "Carbs (g)" : 50,
                "Servings" : 1.0
            }
        ],
        "Dinner" : [
            {
                "Food Name" : "Steak",
                "Calories" : 350,
                "Protein (g)" : 30,
                "Fat (g)" : 12,
                "Carbs (g)" : 2,
                "Servings" : 1.0
            },
            {
                "Food Name" : "Brown Rice",
                "Calories" : 100,
                "Protein (g)" : 4,
                "Fat (g)" : 2,
                "Carbs (g)" : 50,
                "Servings" : 2.5
            }
        ],
        "Snacks" : [
            {
                "Food Name" : "Protein Bar",
                "Calories" : 200,
                "Protein (g)" : 22,
                "Fat (g)" : 9,
                "Carbs (g)" : 3,
                "Servings" : 1.0
            },
        ]
    }

    return jsonify(EXAMPLE_PLAN)
