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
  ListItem,
  Overlay,
  colors,
} from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
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
            <ListItem
              key={i}
              title={dish["Food Name"]}
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
    curr_date = yyyy + '-' + mm + '-' + dd

    this.state = {
      overlay_visible: false,
      date: curr_date,
      meal_to_edit: "Breakfast",
      food_to_edit: 0,
      food_to_edit_name: null,
      DATA: null,
      ALTERNATE_FOODS: null,
      loading: true,
      error: false,
    };
    this.openUpdateOverlay = this.openUpdateOverlay.bind(this)
    this.updateFood = this.updateFood.bind(this)
    this.quitOverlay = this.quitOverlay.bind(this)
    this.deleteFood = this.deleteFood.bind(this)
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

  openUpdateOverlay = async (meal_to_edit, food_to_edit, food_to_edit_name, food_id, food_servings) => {
    await this.setState({
      overlay_visible: true,
      meal_to_edit: meal_to_edit,
      food_to_edit: food_to_edit,
      food_to_edit_name: food_to_edit_name,
      ALTERNATE_FOODS: null,
    })
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
          console.log(`Recieved response ${JSON.stringify(responseJson)}`);
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
      overlay_visible: false,
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
      overlay_visible: false,
    })
  }

  quitOverlay () {
    this.setState({
      overlay_visible: false,
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

            <View>
              {
                MEALS.map((meal, i) => (
                  <MealComponent
                    name={meal}
                    dishes={this.state.DATA[meal]}
                    key={i}
                    foodChange={this.openUpdateOverlay}
                    animationSpeed={i}
                  />
                ))
              }
            </View>

            <Overlay 
              isVisible={this.state.overlay_visible}
              onBackdropPress={this.quitOverlay}
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
                              ('servings' in this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit]) ?
                              `${fact.charAt(0).toUpperCase() + fact.substring(1)}: ${this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit][fact].toFixed(1)}`
                              :
                              `${fact.charAt(0).toUpperCase() + fact.substring(1)}: ${this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit][FACT_MAP[fact]].toFixed(1)}`
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
                            title={food["Food Name"]}
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
                    onPress={this.quitOverlay}
                    buttonStyle={styles.nav_button}
                    titleStyle={styles.nav_text}
                  />
                </KeyboardAwareScrollView>
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
