from flask import Blueprint, request, jsonify
import pymongo

from auth_service import auth, get_id_from_request

plan_service = Blueprint('plan_service', __name__)

# Function: get_daily_plan
# Returns a daily_plan object to front end
@plan_service.route('/api/users/plan/get_daily_meals', methods = ["POST"])
@auth.login_required
def get_daily_meals():
    # Hard Coded logic, get rid of this eventually as we can get the plan from the user themself
    params = request.json
    if not params or "goal" not in params:
        return "Please include a nutrition goal", 400
    goal = params["goal"]

    # Hard-coded example: replace with daily plan generator
    EXAMPLE_PLAN_BULK = {
        "Breakfast" : [
            {
                "food_id" : 1034,
                "Food Name" : "Cheese, port de salut",
                "Calories" : 100,
                "Protein (g)" : 10,
                "Fat (g)" : 9,
                "Carbs (g)" : 0.4,
                "Servings" : 2.0
            },
            {
                "food_id" : 18019,
                "Food Name" : "Banana Bread",
                "Calories" : 100,
                "Protein (g)" : 1,
                "Fat (g)" : 1,
                "Carbs (g)" : 15,
                "Servings" : 2.0
            }
        ],
        "Lunch" : [
            {
                "food_id" : 42128,
                "Food Name" : "Turkey Ham",
                "Calories" : 200,
                "Protein (g)" : 30,
                "Fat (g)" : 3,
                "Carbs (g)" : 3,
                "Servings" : 2.0
            },
            {
                "food_id" : 18350,
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
                "food_id" : 23000,
                "Food Name" : "Steak",
                "Calories" : 350,
                "Protein (g)" : 30,
                "Fat (g)" : 12,
                "Carbs (g)" : 2,
                "Servings" : 1.0
            },
            {
                "food_id" : 42204,
                "Food Name" : "Rice Cake",
                "Calories" : 100,
                "Protein (g)" : 4,
                "Fat (g)" : 2,
                "Carbs (g)" : 50,
                "Servings" : 2.5
            }
        ],
        "Snacks" : [
            {
                "food_id" : 25067,
                "Food Name" : "Protein Bar",
                "Calories" : 200,
                "Protein (g)" : 22,
                "Fat (g)" : 9,
                "Carbs (g)" : 3,
                "Servings" : 1.0
            },
        ]
    }

    EXAMPLE_PLAN_CUT = {
        "Breakfast" : [
            {
                "food_id" : 43285,
                "Food Name" : "Scrambled Eggs",
                "Calories" : 100,
                "Protein (g)" : 10,
                "Fat (g)" : 9,
                "Carbs (g)" : 0.4,
                "Servings" : 2.0
            }
        ],
        "Lunch" : [
            {
                "food_id" : 11274,
                "Food Name" : "Mustard Spinach",
                "Calories" : 200,
                "Protein (g)" : 30,
                "Fat (g)" : 3,
                "Carbs (g)" : 3,
                "Servings" : 2.0
            },
            {
                "food_id" : 42116,
                "Food Name" : "Creamy Dressing",
                "Calories" : 200,
                "Protein (g)" : 4,
                "Fat (g)" : 2,
                "Carbs (g)" : 50,
                "Servings" : 1.0
            }
        ],
        "Dinner" : [
            {
                "food_id" : 5000,
                "Food Name" : "Chicken Breast",
                "Calories" : 350,
                "Protein (g)" : 30,
                "Fat (g)" : 12,
                "Carbs (g)" : 2,
                "Servings" : 1.0
            },
            {
                "food_id" : 11252,
                "Food Name" : "Iceberg Lettuce",
                "Calories" : 100,
                "Protein (g)" : 4,
                "Fat (g)" : 2,
                "Carbs (g)" : 50,
                "Servings" : 2.5
            }
        ],
        "Snacks" : [
            {
                "food_id" : 25067,
                "Food Name" : "Protein Bar",
                "Calories" : 200,
                "Protein (g)" : 22,
                "Fat (g)" : 9,
                "Carbs (g)" : 3,
                "Servings" : 1.0
            },
        ]
    }

    EXAMPLE_PLAN_MAINTAIN = {
        "Breakfast" : [
            {
                "food_id" : 16097,
                "Food Name" : "Chunky Peanut Butter",
                "Calories" : 100,
                "Protein (g)" : 10,
                "Fat (g)" : 9,
                "Carbs (g)" : 0.4,
                "Servings" : 2.0
            }
        ],
        "Lunch" : [
            {
                "food_id" : 18641,
                "Food Name" : "Hamburger Roll",
                "Calories" : 200,
                "Protein (g)" : 30,
                "Fat (g)" : 3,
                "Carbs (g)" : 3,
                "Servings" : 2.0
            },
            {
                "food_id" : 7043,
                "Food Name" : "Sliced Roast Beef",
                "Calories" : 200,
                "Protein (g)" : 4,
                "Fat (g)" : 2,
                "Carbs (g)" : 50,
                "Servings" : 1.0
            }
        ],
        "Dinner" : [
            {
                "food_id" : 16126,
                "Food Name" : "Tofu",
                "Calories" : 350,
                "Protein (g)" : 30,
                "Fat (g)" : 12,
                "Carbs (g)" : 2,
                "Servings" : 1.0
            },
            {
                "food_id" : 20109,
                "Food Name" : "Egg Noodles",
                "Calories" : 100,
                "Protein (g)" : 4,
                "Fat (g)" : 2,
                "Carbs (g)" : 50,
                "Servings" : 2.5
            }
        ],
        "Snacks" : [
            {
                "food_id" : 25067,
                "Food Name" : "Protein Bar",
                "Calories" : 200,
                "Protein (g)" : 22,
                "Fat (g)" : 9,
                "Carbs (g)" : 3,
                "Servings" : 1.0
            },
        ]
    }

    ideal_plan = None

    if goal == "Bulk":
        ideal_plan = EXAMPLE_PLAN_BULK
    elif goal == "Cut":
        ideal_plan = EXAMPLE_PLAN_CUT
    else:
        ideal_plan = EXAMPLE_PLAN_MAINTAIN

    return jsonify(ideal_plan)
