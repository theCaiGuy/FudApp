import React, { Component, useState, useEffect } from 'react';
import {
  Animated,
  AsyncStorage,
  Text,
  SafeAreaView,
  View,
} from 'react-native';
import { styles } from '../Styles/styles'
import {
  Button,
  Card,
  Input,
  ListItem,
  Overlay,
  Slider,
} from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import Icon from 'react-native-vector-icons/FontAwesome';
import { API_PATH } from '../assets/constants'
import {encode as btoa} from 'base-64'


/*
This view contains the user's meal plan for the current date
(TODO: make this page date agnostic w/ date passed in)

On loading the page, request the user's daily meal plan and
create onscreen cards for each meal. Allows the user to click
on each food item to see nutrition information and select
similar alternate foods

Navigate from this page to the User Profile page to view user
settings, adjust settings, and log out
*/


const MEALS = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snacks',
]

const NUTRITION_INFO = [
  'Calories',
  'Carbohydrates (g)',
  'Fat (g)',
  'Protein (g)',
  'servings',
]

const FACT_MAP = {
  'Calories' : 'Calories',
  'Carbohydrates (g)': 'Carb',
  'Fat (g)': 'Fat',
  'Protein (g)': 'Protein',
  'servings': 'Servings',
}


/*
Component that displays foods for a single meal

name: name of the meal
dishes: list of foods for that meal
foodChange: callback function for changing a given food
animationSpeed: # of seconds to fade in
foodAdd: callback function for adding a food to the meal
*/
function MealComponent({
  name,
  dishes,
  foodChange,
  animationSpeed,
  foodAdd,
}) {
  const [fadeAnim] = useState(new Animated.Value(0))  // Initial value for opacity: 0

  React.useEffect(() => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 800 * animationSpeed,
      }
    ).start();
  }, [])

  return (
    <Animated.View
      style={{
        opacity: fadeAnim
      }}
    >
      <Card
        title={name}
        titleStyle={styles.left_align_subheader_text}
        dividerStyle={{width: 0}}
        containerStyle={styles.cardStyle}
      >
        <View>
          { 
            dishes.sort((a, b) => {
              return a["Food Name"].localeCompare(b["Food Name"])
            }).map((dish, i) => (
              <View key ={i}>
                <ListItem
                  key={i}
                  title={
                    ("Servings" in dish) ?
                    `${dish["Food Name"]}, ${dish["Servings"].toFixed(1)} servings`
                    : ("servings" in dish) ?
                    `${dish["Food Name"]}, ${dish["servings"].toFixed(1)} servings`
                    :
                    `${dish["Food Name"]}, 1 serving`
                  }
                  bottomDivider
                  topDivider={i === 0}
                  chevron
                  onPress={
                    ("Servings" in dish) ? 
                    foodChange.bind(this, name, i, dish["Food Name"], dish["food_id"], dish["Servings"])
                    :
                    foodChange.bind(this, name, i, dish["Food Name"], dish["food_id"], dish["servings"])
                  }
                />
              </View>
            ))
          }
        </View>

        <View>
          <Button
            title={`Add Food to ${name}`}
            onPress={foodAdd.bind(this, name)}
            buttonStyle={styles.nav_button}
            titleStyle={styles.nav_text}
          />
        </View>     

      </Card>
    </Animated.View>
  );
}


/*
Main export function for the daily view
Gets meals for the current date (TODO: CHANGE THIS)
Display meals for the current date
Allow users to select recommended foods and add new foods
*/
export class DailyScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      info_overlay_visible: false, // Boolean to display nutrition info/recommended foods overlay
      add_food_overlay_visible: false, // Boolean to display search foods overlay
      date: (new Date()).toISOString().slice(0, 10), // Date for which meals should be grabbed or generated
      last_updated: (new Date()).valueOf(), // Last time the daily page was refreshed
      meal_to_edit: "Breakfast", // Meal which the user has chosen to edit
      food_to_edit: 0, // Index of food item in meal user has chosen to edit
      food_to_edit_name: null, // Name of food item user has chosen to edit
      DATA: null, // Data parsed from meal generation API
      ALTERNATE_FOODS: null, // List of recommended alternatives to food user has selected to edit, obtained from API
      loading: true, // Boolean to display whether the daily page is loading
      error: false, // Boolean to display whether the daily page has encountered an error
      SEARCH_RESULTS: null, // List of foods for the user's query obtained from API
      search_loading: false, // Boolean to display whether the user's search has returned
      query: null, // User's query in search overlay
      add_servings: 1, // Number of servings the user wishes to add of the selected food
      selected_add_food: null, // Food the user has chosen to add to the current meal
    };
    this.openInfoOverlay = this.openInfoOverlay.bind(this);
    this.updateFood = this.updateFood.bind(this);
    this.quitInfoOverlay = this.quitInfoOverlay.bind(this);
    this.deleteFood = this.deleteFood.bind(this);
    this.openAddOverlay = this.openAddOverlay.bind(this);
    this.quitAddFoodOverlay = this.quitAddFoodOverlay.bind(this);
    this.searchFood = this.searchFood.bind(this);
    this.addNewFood = this.addNewFood.bind(this);
    this.selectNewFood = this.selectNewFood.bind(this);
    this.generateDailyMeals = this.generateDailyMeals.bind(this);
    this.fetchDailyMeals = this.fetchDailyMeals.bind(this);
    this.regenerateMeals = this.regenerateMeals.bind(this);
  }

  /*
  Generate new daily meals for the specified date from the generate meals endpoint
  */
  generateDailyMeals(date) {
    AsyncStorage.getItem('userToken').then((token) => {
      console.log(`Basic ${btoa(`${token}:`)}`)

      fetch(`http://${API_PATH}/api/users/plan/get_daily_meals`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${token}:`)}`
        },
        body: JSON.stringify(
          {
            "date": date,
          }
        )
      })
      .then((response) => {
        if (response.status === 401) {
          AsyncStorage.removeItem('userToken').then(() => {
            this.props.navigation.navigate('Auth');
            return;
          });
        }

        if (response.status === 400) {
          this.setState({
            error: true,
            loading: false,
          });
          return;
        }
        
        response.json().then((responseJson) => {
          this.setState({
            DATA: responseJson,
            loading: false
          });
          console.log(`Recieved response ${JSON.stringify(responseJson)} from meal generator`);
        });
      });
    }).catch((error) => {
      // console.error(error);
      this.setState({
        error: true,
        loading: false,
      });
    });
  }


  /*
  Get daily meals for the specified date from the user history endpoint
  */
  fetchDailyMeals(date) {
    AsyncStorage.getItem('userToken').then((token) => {
      console.log(`Basic ${btoa(`${token}:`)}`)

      fetch(`http://${API_PATH}/api/users/history/fetch_user_history_daily`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${token}:`)}`
        },
        body: JSON.stringify(
          {
            "date": date,
          }
        )
      })
      .then((response) => {
        if (response.status === 401) {
          AsyncStorage.removeItem('userToken').then(() => {
            this.props.navigation.navigate('Auth');
            return;
          });
        }

        if (response.status === 400) {
          this.generateDailyMeals(date)
          return;
        }

        response.json().then((responseJson) => {
          this.setState({
            DATA: responseJson,
            loading: false
          });
          console.log(`Recieved response ${JSON.stringify(responseJson)} from user history`);
        });
      });
    }).catch((error) => {
      // console.error(error);
      this.setState({
        error: true,
        loading: false,
      });
    });
  }

  /*
  Fetches generated meals for the given date
  */
  componentDidMount() {
    let { params } = this.props.navigation.state;
    let date = params ? params.date : null;
    if (!date) {
      date = (new Date()).toISOString().slice(0, 10);
    }
    console.log(date);
    this.setState({
      date: date,
    })
    return(this.fetchDailyMeals(date));
  }

  /*
  Reload screen if new date is selected
  */
  componentDidUpdate(prevProps, prevState) {
    let { params } = this.props.navigation.state;
    let prop_date = params ? params.date : null;
    let curr_date = this.state.date;

    let prefs_updated_time = params ? params.prefs_updated_time : null;
    let curr_updated_time = this.state.last_updated;

    if (prefs_updated_time && prefs_updated_time > curr_updated_time) {
      this.setState({
        last_updated: (new Date()).valueOf(),
        loading: true,
      });
      return (this.generateDailyMeals(this.state.date));
    }

    if (prop_date && curr_date !== prop_date) {
      this.setState({
        last_updated: (new Date()).valueOf(),
        date: prop_date,
        loading: true,
      });
      return (this.fetchDailyMeals(prop_date));
    }

  }

  /*
  Opens nutrition info + recommended alternatives overlay for the selected food item
  Gets alternatives from the API
  */
  openInfoOverlay = async (meal_to_edit, food_to_edit, food_to_edit_name, food_id, food_servings) => {
    await this.setState({
      info_overlay_visible: true,
      meal_to_edit: meal_to_edit,
      food_to_edit: food_to_edit,
      food_to_edit_name: food_to_edit_name,
      ALTERNATE_FOODS: null,
    });

    if (!food_servings) {
      food_servings = 1
    }

    return AsyncStorage.getItem('userToken').then((token) => {
      fetch(`http://${API_PATH}/api/food/get_similar_foods_user`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${token}:`)}`
        },
        body: JSON.stringify({
          "food_id": food_id,
          "servings": food_servings,
          "num_foods": 10,
        })
      })
      .then((response) => {
        if (response.status === 401) {
          AsyncStorage.removeItem('userToken').then(() => {
            this.props.navigation.navigate('Auth');
            return;
          });
        }
        response.json().then((responseJson) => {
          this.setState({
            ALTERNATE_FOODS: responseJson,
          });
        });
      })
    }).catch((error) => {
      // console.error(error);
      this.setState({
        error: true
      })
    });
  }

  /*
  Swaps out the selected food with one of the alternatives
  */
  updateFood = async (updatedFood) => {
    let meal_to_edit = this.state.meal_to_edit;
    let food_to_edit = this.state.food_to_edit;
    let date = this.state.date;
    var data = {... this.state.DATA};
    let prev_food_id = data[meal_to_edit][food_to_edit]["food_id"];

    await AsyncStorage.getItem('userToken').then((token) => {
      fetch(`http://${API_PATH}/api/users/history/set_user_history_food`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${token}:`)}`
        },
        body: JSON.stringify(
          {
            "date": date,
            "meal": meal_to_edit,
            "prev_food_id": prev_food_id,
            "food_id": updatedFood["food_id"],
            "servings": updatedFood["Servings"],
          }
        )
      })
      .then((response) => {
        if (response.status === 401) {
          AsyncStorage.removeItem('userToken').then(() => {
            this.props.navigation.navigate('Auth');
            return;
          });
        }

        if (response.status === 400) {
          this.setState({
            error: true,
            loading: false,
          });
        }

        console.log(`Recieved response ${JSON.stringify(response)} for updating food`);
      
      });
    }).catch((error) => {
      // console.error(error);
      this.setState({
        error: true,
        loading: false,
      });
      return;
    });

    data[meal_to_edit][food_to_edit] = updatedFood;

    await this.setState({
      info_overlay_visible: false,
      DATA: data,
      meal_to_edit: null,
      food_to_edit: null,
    });
  }

  /*
  Add the selected food + number of servings from the user's search query to the given meal
  */
  addNewFood = async () => {
    if (this.state.selected_add_food) {
      let meal_to_edit = this.state.meal_to_edit;
      let date = this.state.date;
      var data = {... this.state.DATA};
      let selected_add_food = this.state.selected_add_food;

      selected_add_food["Servings"] = this.state.add_servings;
      data[meal_to_edit].push(selected_add_food);
      let curr_meal = data[meal_to_edit];

      var foods_dict = {};
      var i;
      for (i in curr_meal) {
        let food = curr_meal[i]
        let food_id = food["food_id"]
        let servings = food["Servings"]
        foods_dict[food_id] = servings
      }

      console.log(JSON.stringify(
        {
          "date": date,
          "meal": meal_to_edit,
          "foods": foods_dict,
        }
      ))

      await AsyncStorage.getItem('userToken').then((token) => {
        fetch(`http://${API_PATH}/api/users/history/set_user_history_meal`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${token}:`)}`
          },
          body: JSON.stringify(
            {
              "date": date,
              "meal": meal_to_edit,
              "foods": foods_dict,
            }
          )
        })
        .then((response) => {
          if (response.status === 401) {
            AsyncStorage.removeItem('userToken').then(() => {
              this.props.navigation.navigate('Auth');
              return;
            });
          }
  
          if (response.status === 400) {
            this.setState({
              error: true,
              loading: false,
            });
          }
  
          console.log(`Recieved response ${JSON.stringify(response)} for adding food`);
        
        });
      }).catch((error) => {
        // console.error(error);
        this.setState({
          error: true,
          loading: false,
        });
        return;
      });

      await this.setState({
        loading: false,
        meal_to_edit: null,
        food_to_edit: null,
        DATA: data,
        add_food_overlay_visible: false,
      });
    }
  }

  /*
  Deletes the selected food from the meal plan
  */
  deleteFood = async () => {
    let meal_to_edit = this.state.meal_to_edit;
    let food_to_edit = this.state.food_to_edit;
    let date = this.state.date;
    var data = {... this.state.DATA};
    let prev_food_id = data[meal_to_edit][food_to_edit]["food_id"];

    var meal = data[meal_to_edit];
    meal.splice(food_to_edit, 1);
    data[meal_to_edit] = meal;

    await AsyncStorage.getItem('userToken').then((token) => {
      fetch(`http://${API_PATH}/api/users/history/delete_user_history_food`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${token}:`)}`
        },
        body: JSON.stringify(
          {
            "date": date,
            "meal": meal_to_edit,
            "prev_food_id": prev_food_id,
          }
        )
      })
      .then((response) => {
        if (response.status === 401) {
          AsyncStorage.removeItem('userToken').then(() => {
            this.props.navigation.navigate('Auth');
            return;
          });
        }

        if (response.status === 400) {
          this.setState({
            error: true,
            loading: false,
          });
        }

        console.log(`Recieved response ${JSON.stringify(response)} for deleting food`);
      
      });
    }).catch((error) => {
      // console.error(error);
      this.setState({
        error: true,
        loading: false,
      });
      return;
    });

    await this.setState({
      info_overlay_visible: false,
      DATA: data,
      meal_to_edit: null,
      food_to_edit: null,
    });
  }

  /*
  Opens overlay allowing the user to search for and add new foods to the given meal
  */
  openAddOverlay = async (meal_to_edit) => {
    await this.setState({
      meal_to_edit: meal_to_edit,
      add_food_overlay_visible: true,
      SEARCH_RESULTS: null,
      add_servings: 1,
      selected_add_food: null,
    });
  }

  /*
  Close the nutrition info / recommended foods overlay without changing meals
  */
  quitInfoOverlay () {
    this.setState({
      info_overlay_visible: false,
    });
  }

  /*
  Close the search / add foods overlay without changing meals
  */
  quitAddFoodOverlay () {
    this.setState({
      add_food_overlay_visible: false,
    });
  }

  /*
  Obtain search results from the API based on the user's query
  */
  searchFood = async () => {
    let query = this.state.query;

    await this.setState({
      search_loading: true
    });

    return AsyncStorage.getItem('userToken').then((token) => {
      fetch(`http://${API_PATH}/api/food/get_foods_keyword_user`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${token}:`)}`
        },
        body: JSON.stringify({
          "query" : query,
        })
      })
      .then((response) => {
        if (response.status === 401) {
          AsyncStorage.removeItem('userToken').then(() => {
            this.props.navigation.navigate('Auth');
            return;
          });
        }
        response.json().then((responseJson) => {
          this.setState({
            SEARCH_RESULTS: responseJson,
            search_loading: false
          });
        });
      })
    }).catch((error) => {
      // console.error(error);
      this.setState({
        error: true,
        search_loading: false
      })
    });
  }

  /*
  Allow the user to select a new food to add to the given meal
  */
  selectNewFood = async (newFood) => {
    await this.setState({
      selected_add_food: newFood,
    });
  }

  /*
  Regenerate the user's meals
  */
  regenerateMeals = async () => {
    await this.setState({
      loading: true,
    });
    let date = this.state.date;
    this.generateDailyMeals(date);
  }

  /*
  Do not show the react navigation header
  */
  static navigationOptions = {
    headerShown: false,
  };

    render() {
      /*
      If the state is set to loading display the loading screen
      */
      if (this.state.loading) {
        return(
          <SafeAreaView style={styles.container}>
            <Text style={styles.central_subheader_text}>Loading Füd plan...</Text>
            <Button
              title="Return to Sign In"
              onPress={this._signOutAsync}
              buttonStyle={styles.sign_out_button}
              titleStyle={styles.nav_text}
            />
          </SafeAreaView>
        )
      }

      /*
      If the state is set to error display the error screen
      */
      if (this.state.error) {
        return(
          <SafeAreaView style={styles.container}>
            <Text style={styles.central_subheader_text}>An error was encountered</Text>
            <Button
              title="Return to Sign In"
              onPress={this._signOutAsync}
              buttonStyle={styles.sign_out_button}
              titleStyle={styles.nav_text}
            />
          </SafeAreaView>
        )
      }

      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <Text style={styles.central_header_text}>Your Füd Plan</Text>

            <Text style={styles.central_subheader_text}>{this.state.date}</Text>

            {/*
              Generate a card for each meal. See: MealComponent
            */}

            <View>
              {
                MEALS.map((meal, i) => (
                  <MealComponent
                    name={meal}
                    dishes={this.state.DATA[meal]}
                    key={i}
                    foodChange={this.openInfoOverlay}
                    animationSpeed={i}
                    foodAdd={this.openAddOverlay}
                  />
                ))
              }
            </View>

            {/*
              Food Info Overlay
              View Nutrition Facts for selected food
              View recommended alternative foods
              Switch out selected food for recommended alternative
              TODO: Delete selected food
            */}

            <Overlay 
              isVisible={this.state.info_overlay_visible}
              onBackdropPress={this.quitInfoOverlay}
            >
              <View>
                <KeyboardAwareScrollView>
                  <View>
                    {
                      (this.state.meal_to_edit !== null && this.state.food_to_edit !== null) ? (
                        <View>
                          <Text style={styles.left_align_subheader_text}>
                            {"Nutrition Facts: " + this.state.food_to_edit_name}
                          </Text>

                          {/*
                            Nutrition Facts 
                          */}
                          <View>
                            {
                              (this.state.DATA && this.state.DATA[this.state.meal_to_edit].length !== 0) ? (
                                NUTRITION_INFO.map((fact, i) => (
                                  <ListItem
                                    key={i}
                                    title={
                                      (this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit][fact]) ? 
                                        `${fact.charAt(0).toUpperCase() + fact.substring(1)}: ${this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit][fact].toFixed(1)}`
                                      : (this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit][FACT_MAP[fact]]) ?
                                        `${fact.charAt(0).toUpperCase() + fact.substring(1)}: ${this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit][FACT_MAP[fact]].toFixed(1)}`
                                      :
                                        `${fact.charAt(0).toUpperCase() + fact.substring(1)}: 0`
                                    }
                                    bottomDivider
                                    topDivider={i === 0}
                                  />
                                ))
                              ) : (
                                <View>
                                  <Text style={styles.central_subheader_text}>Data Not Loaded</Text>
                                </View>
                              )
                            }
                          </View>

                          {/*
                            Alternate Foods
                          */}

                          <Text style={styles.left_align_subheader_text}>
                            {"Don't like " + this.state.food_to_edit_name + "? Try something similar!"}
                          </Text>

                          <View>
                            {
                              (this.state.ALTERNATE_FOODS) ? (
                                this.state.ALTERNATE_FOODS.map((food, i) => (
                                  <ListItem
                                    key={i}
                                    title={
                                      ("Servings" in food) ?
                                      `${food["Food Name"]}, ${food["Servings"].toFixed(1)} servings`
                                      : ("servings in food") ? 
                                      `${food["Food Name"]}, ${food["servings"].toFixed(1)} servings`
                                      : 
                                      `${food["Food Name"]}`
                                    }
                                    bottomDivider
                                    topDivider={i === 0}
                                    chevron
                                    onPress={this.updateFood.bind(this, food)}
                                  />
                                ))
                              ) : (
                                <View>
                                  <Text style={styles.central_subheader_text}>Loading...</Text>
                                </View>
                              )
                            }
                          </View>

                          {/*
                            NOTE: This button currently doesn't do anything. Implement it when user histories
                            become a thing and you can refresh the data.
                          */}
                          
                          <Button
                            title="Delete This Item"
                            onPress={this.deleteFood}
                            buttonStyle={styles.sign_out_button}
                            titleStyle={styles.nav_text}
                          />

                          <Button
                            title="Close"
                            onPress={this.quitInfoOverlay}
                            buttonStyle={styles.overlay_bottom_button}
                            titleStyle={styles.nav_text}
                          />
                        </View>

                      ) : (
                        <View />
                      )
                    }
                  </View>
                </KeyboardAwareScrollView>
              </View>
            </Overlay>

            {/*
              Add Food Overlay
              Search for and add new foods to the selected meal
            */}

            <Overlay
              isVisible={this.state.add_food_overlay_visible}
              onBackdropPress={this.quitAddFoodOverlay}
            >
              <View style={styles.container}>
                <Input
                  containerStyle={styles.search_text_input}
                  labelStyle={styles.profile_text_input_label}
                  leftIcon={
                    <Icon
                      name='search'
                      size={18}
                      color='black'
                      style={{marginHorizontal: 10}}
                    />
                  }
                  onChangeText = {(text) => this.setState({query: text})}
                  onEndEditing = {(text) => this.searchFood()}
                />

                <View>
                  {
                    (this.state.search_loading) ? (
                      <View>
                        <Text style={styles.central_subheader_text}>Loading...</Text>
                      </View>
                    ) : (
                      <View />
                    )
                  }
                </View>

                <KeyboardAwareScrollView>
                  <View>
                    {
                      (this.state.SEARCH_RESULTS) ? (
                        this.state.SEARCH_RESULTS.map((food, i) => (
                          <ListItem
                            key={i}
                            title={food["Food Name"]}
                            bottomDivider
                            topDivider={i === 0}
                            chevron
                            onPress={this.selectNewFood.bind(this, food)}
                          />
                        ))
                      ) : (
                        <View/>
                      )
                    }
                  </View>
                </KeyboardAwareScrollView>

                <View>
                  {
                    (this.state.selected_add_food) ? (
                      <View>
                        <Text style={styles.left_align_subheader_text}>
                          {`${this.state.add_servings.toFixed(1)} servings of ${this.state.selected_add_food["Food Name"]}`}
                        </Text>

                        <Slider
                          value={this.state.add_servings}
                          minimumValue={0.1}
                          maximumValue={10}
                          thumbTintColor={"#3b821b"}
                          style={styles.servings_slider}
                          onValueChange={value => this.setState({ add_servings: value })}
                        />
                      </View>
                    ) : (
                      <View />
                    )
                  }
                </View>

                <View>
                  {
                    (this.state.selected_add_food) ? (
                      <Button
                        title="Add Food"
                        onPress={this.addNewFood}
                        buttonStyle={styles.overlay_bottom_button}
                        titleStyle={styles.nav_text}
                      />
                    ) : (
                      <Button
                        title="Cancel"
                        onPress={this.quitAddFoodOverlay}
                        buttonStyle={styles.overlay_bottom_button}
                        titleStyle={styles.nav_text}
                      />
                    )
                  }
                </View>

              </View>
            </Overlay>

            <Button
              title="View Progress"
              onPress={this._goMonthAsync}
              buttonStyle={styles.nav_button}
              titleStyle={styles.nav_text}
            />

            <Button
              title="User Profile"
              onPress={this._goProfileAsync}
              buttonStyle={styles.nav_button}
              titleStyle={styles.nav_text}
            />

            <Button
              title="Regenerate Meals"
              onPress={this.regenerateMeals}
              buttonStyle={styles.nav_button}
              titleStyle={styles.nav_text}
            />

            <Button
              title="Sign Out of Füd"
              onPress={this._signOutAsync}
              buttonStyle={styles.sign_out_button}
              titleStyle={styles.nav_text}
            />

          </KeyboardAwareScrollView>
        </SafeAreaView>
      );
    }

    /*
    Navigate to goals_view to allow the user to change their goals + settings
    */
    _changePrefsAsync = () => {
      this.props.navigation.navigate('EditGoals');
    }

    /*
    Navigate to the monthly view
    */
    _goMonthAsync = async () => {
      this.props.navigation.navigate('Month', {'date': this.state.date})
    }

    /*
    Navigate to the user profile view
    */ 
    _goProfileAsync = async () => {
      this.props.navigation.navigate('Profile')
    }

    /*
    Sign out of the Fud app and navigate to the sign on screen
    */
    _signOutAsync = async () => {
      await AsyncStorage.clear();
      this.props.navigation.navigate('Auth');
    };
  }
