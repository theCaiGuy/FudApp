from flask import Blueprint, request, jsonify
import pymongo
import random

from goals_service import calculate_tdee_macros

from auth_service import verify_credentials, get_id_from_request

plan_service = Blueprint('plan_service', __name__)

client = pymongo.MongoClient("mongodb+srv://sushil:sushil@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority")
db = client.foods.food_data

client_user = pymongo.MongoClient("mongodb+srv://connor:connor@foodcluster-trclg.mongodb.net/test?retryWrites=true&w=majority")
db_user = client_user.users.users_info

db_user_history = client_user.users.users_history

"""
Function: get_daily_plan

Returns a daily_plan object to front end. This object is a Dict with keys as meals,
values as lists of meal objects (which themselves are dicts comntaining food info)

Arguments:
user_id (int)
goal (string) : Either "Bulk", "Cut", or "Maintain" (deprecated)
"""
@plan_service.route('/api/users/plan/get_daily_meals', methods = ["POST"])
def get_daily_meals():
    if not verify_credentials(request):
        return jsonify({"err": "Unauthorized: Invalid or missing credentials"}), 401
    params = request.json

    user_id = get_id_from_request(request)
    if not user_id:
        return "No user found", 400


    #DAILY PLAN GENERATOR
    dailyPlan = generateDailyMeals(user_id, "sample date")

    #save to date in user_history db
    user_history = db_user_history.find_one({"user_id" : user_id})
    if user_history==None: #doesn't exist yet so create
        new_history = {"user_id": user_id, "history": {}}
        db_user_history.insert_one(new_history)
        user_history = db_user_history.find_one({"user_id" : user_id})
    #go through daily plan for bfast, lunch, dinner, snacks, and one by one add
    dateObject = {}
    #Breakfast
    breakfastObject = {}
    breakfast = dailyPlan["Breakfast"]
    for food in breakfast:
        breakfastObject[str(food["food_id"])] = round(food["Servings"],1)
    dateObject["Breakfast"] = breakfastObject
    #Lunch
    lunchObject = {}
    lunch = dailyPlan["Lunch"]
    for food in lunch:
        lunchObject[str(food["food_id"])] = round(food["Servings"],1)
    dateObject["Lunch"] = lunchObject
    #Dinner
    dinnerObject = {}
    dinner = dailyPlan["Dinner"]
    for food in dinner:
        dinnerObject[str(food["food_id"])] = round(food["Servings"],1)
    dateObject["Dinner"] = dinnerObject
    #Snacks
    dateObject["Snacks"] = {}

    #add to user_history    
    currHistoryObject = user_history["history"]
    currHistoryObject["2020-03-04"] = dateObject #hardcoded date for now b/c frontend isn't passing in date
    db_user_history.update_one({"user_id" : user_id}, {"$set": {"history" : currHistoryObject}})

    print(dailyPlan)
    return jsonify(dailyPlan)





# Function: generateDailyMeals:

# Given a user id and date, finds the user's prescribed calories and calls function to generate meals given cals

# Arguments:
#     userID: user's unique ID provided from front-end
#     date: date for which the meals are to be created
def generateDailyMeals(user_id, date):
    #get macros
    proteinGroups = ["Sausages and Luncheon Meats", 
                    "Poultry Products",
                    "Pork Products",
                    "Legumes and Legume Products",
                    "Lamb, Veal, and Game Products",
                    "Finfish and Shellfish Products",
                    "Dairy and Egg Products",
                    "Beef Products"]
    fatGroups = ["Nut and Seed Products",
                    "Fats and Oils"]
    carbGroups = ["Vegetables and Vegetable Products",
                     "Sweets",
                     "Fruits and Fruit Juices",
                     "Cereal Grains and Pasta",
                     "Breakfast Cereals"]
    RESTRICTIONS_MAP = {
    "Vegan" : {"Sausages and Luncheon Meats", "Poultry Products", "Pork Products", "Lamb, Veal, and Game Products", "Finfish and Shellfish Products", "Fats and Oils", "Dairy and Egg Products", "Beef Products"},
    "Vegetarian" : {"Sausages and Luncheon Meats", "Poultry Products", "Pork Products", "Lamb, Veal, and Game Products", "Finfish and Shellfish Products", "Beef Products"},
    "Pescatarian" : {"Sausages and Luncheon Meats", "Poultry Products", "Pork Products", "Lamb, Veal, and Game Products", "Beef Products"},
    "No Red Meat" : {"Sausages and Luncheon Meats", "Lamb, Veal, and Game Products", "Beef Products"},
    "No Pork" : {"Pork Products"},
    "No Beef" : {"Beef Products"},
    "Nut Allergy" : {"Legumes and Legume Products", "Nut and Seed Products"}
    }
    user_info = db_user.find_one({"user_id" : user_id})

    #CALCULATE TEMPLATES BASED ON RESTRICTIONS
    restrictions = user_info['restrictions']
    if len(restrictions)==0: #no restrictions
        myProtein = proteinGroups.copy()
        myFat = fatGroups.copy()
        myCarb = carbGroups.copy()
    else: #has restrictions
        myProtein = proteinGroups.copy()
        myCarb = carbGroups.copy()
        myFat = fatGroups.copy()
        for restriction in restrictions:
            #protein
            for food in proteinGroups:
                if food in RESTRICTIONS_MAP[restriction]: #bad food
                    myProtein.remove(food)
            #carbs
            for food in carbGroups:
                if food in RESTRICTIONS_MAP[restriction]: #bad food
                    myCarb.remove(food)
            #fat
            for food in fatGroups:
                if food in RESTRICTIONS_MAP[restriction]: #bad food
                    myFat.remove(food)

    macros = calculate_tdee_macros(user_info)
    calories = macros["tdee"]
    #mealTemplate1
    mealTemplate1 = [random.choice(myProtein), random.choice(myCarb), random.choice(myFat)]
    mealTemplate2 = [random.choice(myProtein), random.choice(myCarb), random.choice(myFat)]
    mealTemplate3 = [random.choice(myProtein), random.choice(myCarb), random.choice(myFat)]

    return generateDailyMeals_Cals(calories, mealTemplate1, mealTemplate2, mealTemplate3)




# Function: generateDailyMeals_cals:

# Main function of meal generation. Creates meals for breakfast lunch, dinner, and calculates serving sizes proportionate to calorie intake.

# Arguments:
#     calories: amount of calories/day
#     template1,2,3: food group templates for breakfast, lunch, dinner
def generateDailyMeals_Cals(calories, template1, template2, template3):
    caloriesPerMeal = calories/3
    dailyPlan = {}
    #STEP 1: GENERATE MEALS AND ADJUST SERVING SIZES BASED ON CALORIES
    #BREAKFAST
    breakfast = generateMeal(template1)
    serving1 = (0.5*caloriesPerMeal)/(breakfast[0][1][3])
    breakfast[0][1][0] = breakfast[0][1][0]*float(serving1)
    breakfast[0][1][1] = breakfast[0][1][1]*float(serving1)
    breakfast[0][1][2] = breakfast[0][1][2]*float(serving1)
    breakfast[0][1][3] = breakfast[0][1][3]*float(serving1)
    breakfast[0][1].append(serving1)

    serving2 = (0.25*caloriesPerMeal)/(breakfast[1][1][3])
    breakfast[1][1][0] = breakfast[1][1][0]*float(serving2)
    breakfast[1][1][1] = breakfast[1][1][1]*float(serving2)
    breakfast[1][1][2] = breakfast[1][1][2]*float(serving2)
    breakfast[1][1][3] = breakfast[1][1][3]*float(serving2)
    breakfast[1][1].append(serving2)

    serving3 = (0.25*caloriesPerMeal)/(breakfast[2][1][3])
    breakfast[2][1][0] = breakfast[2][1][0]*float(serving3)
    breakfast[2][1][1] = breakfast[2][1][1]*float(serving3)
    breakfast[2][1][2] = breakfast[2][1][2]*float(serving3)
    breakfast[2][1][3] = breakfast[2][1][3]*float(serving3)
    breakfast[2][1].append(serving3)
    #     print(breakfast)

    #LUNCH
    lunch = generateMeal(template2)
    serving1 = (0.5*caloriesPerMeal)/(lunch[0][1][3])
    lunch[0][1][0] = lunch[0][1][0]*float(serving1)
    lunch[0][1][1] = lunch[0][1][1]*float(serving1)
    lunch[0][1][2] = lunch[0][1][2]*float(serving1)
    lunch[0][1][3] = lunch[0][1][3]*float(serving1)
    lunch[0][1].append(serving1)

    serving2 = (0.25*caloriesPerMeal)/(lunch[1][1][3])
    lunch[1][1][0] = lunch[1][1][0]*float(serving2)
    lunch[1][1][1] = lunch[1][1][1]*float(serving2)
    lunch[1][1][2] = lunch[1][1][2]*float(serving2)
    lunch[1][1][3] = lunch[1][1][3]*float(serving2)
    lunch[1][1].append(serving2)

    serving3 = (0.25*caloriesPerMeal)/(lunch[2][1][3])
    lunch[2][1][0] = lunch[2][1][0]*float(serving3)
    lunch[2][1][1] = lunch[2][1][1]*float(serving3)
    lunch[2][1][2] = lunch[2][1][2]*float(serving3)
    lunch[2][1][3] = lunch[2][1][3]*float(serving3)
    lunch[2][1].append(serving3)
    #     print(lunch)

    #DINNER
    dinner = generateMeal(template3)
    serving1 = (0.5*caloriesPerMeal)/(dinner[0][1][3])
    dinner[0][1][0] = dinner[0][1][0]*float(serving1)
    dinner[0][1][1] = dinner[0][1][1]*float(serving1)
    dinner[0][1][2] = dinner[0][1][2]*float(serving1)
    dinner[0][1][3] = dinner[0][1][3]*float(serving1)
    dinner[0][1].append(serving1)

    serving2 = (0.25*caloriesPerMeal)/(dinner[1][1][3])
    dinner[1][1][0] = dinner[1][1][0]*float(serving2)
    dinner[1][1][1] = dinner[1][1][1]*float(serving2)
    dinner[1][1][2] = dinner[1][1][2]*float(serving2)
    dinner[1][1][3] = dinner[1][1][3]*float(serving2)
    dinner[1][1].append(serving2)

    serving3 = (0.25*caloriesPerMeal)/(dinner[2][1][3])
    dinner[2][1][0] = dinner[2][1][0]*float(serving3)
    dinner[2][1][1] = dinner[2][1][1]*float(serving3)
    dinner[2][1][2] = dinner[2][1][2]*float(serving3)
    dinner[2][1][3] = dinner[2][1][3]*float(serving3)
    dinner[2][1].append(serving3)
    #     print(dinner)

    #STEP 2: REFORMAT MEALS
    return reformatDay(breakfast, lunch, dinner)





# Function: reformatMeal:

# Reformats list of foods in a meal to format required by front-end API

# Arguments:
#     meal: List of foods (output of generateMeal function)
#          Each element has : [Food name, [Protein(g), Fat(g), Carbs(g), Calories]]
def reformatDay(meal1, meal2, meal3):
    dailyPlan = {}

    #Breakfast
    foodList = []
    for food in meal1:
        foodDict = {}
        foodDict['food_id'] = food[2]
        foodDict['Food Name'] = food[0]
        foodDict['Protein'] = food[1][0]
        foodDict['Fat'] = food[1][1]
        foodDict['Carb'] = food[1][2]
        foodDict['Calories'] = food[1][3]
        foodDict['Servings'] = food[1][4]
        foodList.append(foodDict)
    dailyPlan['Breakfast'] = foodList
    #Lunch
    foodList = []
    for food in meal2:
        foodDict = {}
        foodDict['food_id'] = food[2]
        foodDict['Food Name'] = food[0]
        foodDict['Protein'] = food[1][0]
        foodDict['Fat'] = food[1][1]
        foodDict['Carb'] = food[1][2]
        foodDict['Calories'] = food[1][3]
        foodDict['Servings'] = food[1][4]
        foodList.append(foodDict)
    dailyPlan['Lunch'] = foodList
    #Dinner
    foodList = []
    for food in meal3:
        foodDict = {}
        foodDict['food_id'] = food[2]
        foodDict['Food Name'] = food[0]
        foodDict['Protein'] = food[1][0]
        foodDict['Fat'] = food[1][1]
        foodDict['Carb'] = food[1][2]
        foodDict['Calories'] = food[1][3]
        foodDict['Servings'] = food[1][4]
        foodList.append(foodDict)
    dailyPlan['Dinner'] = foodList
    dailyPlan['Snacks'] = []
    return dailyPlan





# Function: generateMeal:

# Returns list of foods in a given meal. 
#          Each element has : [Food name, [Protein(g), Fat(g), Carbs(g), Calories]]

# Arguments:
#     template: List of food groups specifying what food groups the meal should contain
def generateMeal(template):
    meal = []
    for group in template:
        matches = db.find({'Food Group' : group})
        length = matches.count()
        randomNumber = random.randint(1,length)
        count = 1
        for x in matches:
            if count==randomNumber:
                meal.append([x['Food Name'], get_important_macros(x), x['food_id']])
                break
            count+=1
#     print(meal)
    return meal










# Function: get_important_macros:

# Returns list of an food's most important macronutrients

# Arguments:
#     food_dict: Dictionary object retrieved from Mongo for a food's nutrition values
#     nutrients: List of keys of interest -- defaults to [protein, fat, carbs, calories]

def get_important_macros(food_dict, nutrients = ["Protein (g)", "Fat (g)", "Carbohydrates (g)", "Calories"]):
    return [food_dict[nutrient] for nutrient in nutrients] 
