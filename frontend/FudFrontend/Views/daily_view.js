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
  // 'Snacks',
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
        duration: 1000 * animationSpeed,
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
      >
        {
          dishes.map((dish, i) => (
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
              <View>
                {
                  (i === dishes.length - 1) ? (
                    <Button
                      title={`Add Food to ${name}`}
                      onPress={foodAdd.bind(this, name)}
                      buttonStyle={styles.nav_button}
                      titleStyle={styles.nav_text}
                    />
                  ) : (
                    <View/>
                  )
                }
              </View>
            </View>
          ))
        }
      </Card>
    </Animated.View>
  );
}


export class DailyScreen extends React.Component {
  constructor(props) {
    super(props);
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    let curr_date = yyyy + '-' + mm + '-' + dd

    this.state = {
      info_overlay_visible: false,
      add_food_overlay_visible: false,
      date: curr_date,
      meal_to_edit: "Breakfast",
      food_to_edit: 0,
      food_to_edit_name: null,
      DATA: null,
      ALTERNATE_FOODS: null,
      loading: true,
      error: false,
      SEARCH_RESULTS: null,
      search_loading: false,
      query: null,
      add_servings: 1,
      selected_add_food: null,
    };
    this.openInfoOverlay = this.openInfoOverlay.bind(this)
    this.updateFood = this.updateFood.bind(this)
    this.quitInfoOverlay = this.quitInfoOverlay.bind(this)
    this.deleteFood = this.deleteFood.bind(this)
    this.openAddOverlay = this.openAddOverlay.bind(this)
    this.quitAddFoodOverlay = this.quitAddFoodOverlay.bind(this)
    this.searchFood = this.searchFood.bind(this)
    this.addNewFood = this.addNewFood.bind(this)
    this.selectNewFood = this.selectNewFood.bind(this)
  }

  componentDidMount() {
    return AsyncStorage.getItem('userToken').then((token) => {
      console.log(`Basic ${btoa(`${token}:`)}`)
      let goal = "Cut";
      fetch(`http://${API_PATH}/api/users/plan/get_daily_meals`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${token}:`)}`
        },
        body: JSON.stringify({"goal": goal})
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
            DATA: responseJson,
            loading: false
          });
          console.log(`Recieved response ${JSON.stringify(responseJson)} for user_goal ${goal}`);
        });
      })
    }).catch((error) => {
      console.error(error);
      this.setState({
        error: true,
        loading: false,
      })
    });
  }

  openInfoOverlay = async (meal_to_edit, food_to_edit, food_to_edit_name, food_id, food_servings) => {
    await this.setState({
      info_overlay_visible: true,
      meal_to_edit: meal_to_edit,
      food_to_edit: food_to_edit,
      food_to_edit_name: food_to_edit_name,
      ALTERNATE_FOODS: null,
    })

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
      console.error(error);
      this.setState({
        error: true
      })
    });
  }

  updateFood = async (updatedFood) => {
    let meal_to_edit = this.state.meal_to_edit
    let food_to_edit = this.state.food_to_edit
    var data = {... this.state.DATA}
    data[meal_to_edit][food_to_edit] = updatedFood
    await this.setState({
      info_overlay_visible: false,
      DATA: data
    })
  }

  /*
    NOTE: IMPLEMENT THIS when user histories become a thing
  */

  deleteFood = async () => {
    let meal_to_edit = this.state.meal_to_edit
    let food_to_edit = this.state.food_to_edit
    var data = {... this.state.DATA}
    await this.setState({
      info_overlay_visible: false,
    })
  }

  openAddOverlay = async (meal_to_edit) => {
    await this.setState({
      meal_to_edit: meal_to_edit,
      add_food_overlay_visible: true,
      SEARCH_RESULTS: null,
      add_servings: 1,
      selected_add_food: null,
    })
  }

  quitInfoOverlay () {
    this.setState({
      info_overlay_visible: false,
    })
  }

  quitAddFoodOverlay () {
    this.setState({
      add_food_overlay_visible: false,
    })
  }

  searchFood = async () => {
    let query = this.state.query

    await this.setState({
      search_loading: true
    })
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
      console.error(error);
      this.setState({
        error: true,
        search_loading: false
      })
    });
  }

  addNewFood = async () => {
    if (this.state.selected_add_food) {
      await this.setState({
        add_food_overlay_visible: false,
        loading: true
      })
      let meal_to_edit = this.state.meal_to_edit
      var data = {... this.state.DATA}
      let selected_add_food = this.state.selected_add_food
      selected_add_food["Servings"] = this.state.add_servings
      data[meal_to_edit].push(selected_add_food)
      await this.setState({
        DATA: data
      })
      await this.setState({
        loading: false,
      })
      console.log(this.state.DATA)
    }
  }

  selectNewFood = async (newFood) => {
    await this.setState({
      selected_add_food: newFood,
    })
  }

  static navigationOptions = {
    headerShown: false,
  };

    render() {

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
      NOTE: THIS ISN'T WORKING RIGHT NOW
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
                  
                  <Text style={styles.left_align_subheader_text}>
                    {"Nutrition Facts: " + this.state.food_to_edit_name}
                  </Text>

                  {/*
                    Nutrition Facts 
                  */}
                  <View>
                    {
                      (this.state.DATA) ? (
                        NUTRITION_INFO.map((fact, i) => (
                          <ListItem
                            key={i}
                            title={
                              (this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit][fact]) ? 
                                `${fact.charAt(0).toUpperCase() + fact.substring(1)}: ${this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit][fact].toFixed(1)}`
                              : (this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit][FACT_MAP[fact]]) ?
                                `${fact.charAt(0).toUpperCase() + fact.substring(1)}: ${this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit][FACT_MAP[fact]].toFixed(1)}`
                              :
                                `${fact.charAt(0).toUpperCase() + fact.substring(1)}: N/a`
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

                <Text style={styles.left_align_subheader_text}>
                  {`${this.state.add_servings.toFixed(1)} servings of ${(this.state.selected_add_food) ? this.state.selected_add_food["Food Name"] : ""}`}
                </Text>

                <Slider
                  value={this.state.add_servings}
                  minimumValue={0.1}
                  maximumValue={5}
                  thumbTintColor={"#3b821b"}
                  style={styles.servings_slider}
                  onValueChange={value => this.setState({ add_servings: value })}
                />

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
              title="Adjust Preferences"
              onPress={this._changePrefsAsync}
              buttonStyle={styles.nav_button}
              titleStyle={styles.nav_text}
            />

            {/* <Button
              title="Weekly View"
              onPress={this._goWeekAsync}
              buttonStyle={styles.nav_button}
              titleStyle={styles.nav_text}
            /> */}

            <Button
              title="Monthly View"
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
              title="Sign Out of Füd"
              onPress={this._signOutAsync}
              buttonStyle={styles.sign_out_button}
              titleStyle={styles.nav_text}
            />

          </KeyboardAwareScrollView>
        </SafeAreaView>
      );
    }

    _changePrefsAsync = () => {
      this.props.navigation.navigate('Prefs');
    }

    _goWeekAsync = async () => {
      this.props.navigation.navigate('Week');
    };

    _goMonthAsync = async () => {
      this.props.navigation.navigate('Month')
    }

    _goProfileAsync = async () => {
      this.props.navigation.navigate('Profile')
    }

    _signOutAsync = async () => {
      await AsyncStorage.clear();
      this.props.navigation.navigate('Auth');
    };
  }
