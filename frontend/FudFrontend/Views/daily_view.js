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
  'Snacks',
]

const ALTERNATE_INGREDIENTS = [
  'Papaya',
  'Sausage Egg McMuffin',
  'Durian',
  'Tequila',
  '24oz. Monster Energy',
]


function MealComponent({
  name,
  dishes,
  ingredientChange,
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
              onPress={ingredientChange.bind(this, name, i, dish["Food Name"])}
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
      loading: true,

    };
    this.openUpdateOverlay = this.openUpdateOverlay.bind(this)
    this.updateIngredient = this.updateIngredient.bind(this)
    this.quitOverlay = this.quitOverlay.bind(this)
  }

  componentDidMount() {
    return AsyncStorage.getItem('userToken').then((token) => {
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
    });
  }

  openUpdateOverlay = async (meal_to_edit, food_to_edit, food_to_edit_name) => {
    await this.setState({
      overlay_visible: true,
      meal_to_edit: meal_to_edit,
      food_to_edit: food_to_edit,
      food_to_edit_name: food_to_edit_name,
    })
  }

  updateIngredient = async (updatedFood) => {
    meal_to_edit = this.state.meal_to_edit
    food_to_edit = this.state.food_to_edit
    var data = {... this.state.DATA}
    data[meal_to_edit][food_to_edit]["Food Name"] = updatedFood
    await this.setState({
      overlay_visible: false,
      DATA: data
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
                    ingredientChange={this.openUpdateOverlay}
                    animationSpeed={i}
                  />
                ))
              }
            </View>

            <Overlay isVisible={this.state.overlay_visible}>
              <View>
                <KeyboardAwareScrollView>
                  <Text style={styles.left_align_subheader_text}>
                    {"Nutrition Facts: " + this.state.food_to_edit_name}
                  </Text>
                  <View>
                    {
                      (this.state.DATA) ? (
                      Object.keys(this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit]).map((fact, i) => (
                        <ListItem
                          key={i}
                          title={fact + ": " + this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit][fact]}
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
                  <Text style={styles.left_align_subheader_text}>
                    {"Don't like " + this.state.food_to_edit_name + "? Try something similar!"}
                  </Text>
                  <View>
                    {
                      ALTERNATE_INGREDIENTS.map((food, i) => (
                        <ListItem
                          key={i}
                          title={food}
                          bottomDivider
                          topDivider={i === 0}
                          chevron
                          onPress={this.updateIngredient.bind(this, food)}
                        />
                      ))
                    }
                  </View>
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
