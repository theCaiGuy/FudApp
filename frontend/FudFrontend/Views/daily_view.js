import React, { Component } from 'react';
import {
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
}) {
  return (
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
      DATA: {
        "Breakfast" : [
            {
                "food_id" : 69,
                "Food Name" : "Nothing",
                "Calories" : 69,
                "Protein (g)" : 420,
                "Fat (g)" : 6.9,
                "Carbs (g)" : 4.20,
                "Servings" : 69
            },
        ],
      },
      loading: true,

    };
    this.openUpdateOverlay = this.openUpdateOverlay.bind(this)
    this.updateIngredient = this.updateIngredient.bind(this)
    this.quitOverlay = this.quitOverlay.bind(this)
  }

  componentDidMount() {
    return AsyncStorage.getItem('user_goal').then((goal) => {
      fetch(`http://${API_PATH}/plan/get_daily_meals?goal=${goal}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          DATA: responseJson,
          loading: false
        });
        console.log(`Recieved response ${JSON.stringify(responseJson)} for user_goal ${goal}`);
      })
    }).catch((error) => {
      console.error(error);
    });
  }

  openUpdateOverlay(meal_to_edit, food_to_edit, food_to_edit_name) {
    this.setState({
      overlay_visible: true,
      meal_to_edit: meal_to_edit,
      food_to_edit: food_to_edit,
      food_to_edit_name: food_to_edit_name,
    })
  }

  updateIngredient(updatedFood) {
    meal_to_edit = this.state.meal_to_edit
    food_to_edit = this.state.food_to_edit
    var data = {... this.state.DATA}
    data[meal_to_edit][food_to_edit]["Food Name"] = updatedFood
    this.setState({
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
                      Object.keys(this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit]).map((fact, i) => (
                        <ListItem
                          key={i}
                          title={fact + ": " + this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit][fact]}
                          bottomDivider
                          topDivider={i === 0}
                        />
                      ))
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
            <Button
              title="Weekly View"
              onPress={this._goWeekAsync}
              buttonStyle={styles.nav_button}
              titleStyle={styles.nav_text}
            />
            <Button
              title="Monthly View"
              onPress={this._goMonthAsync}
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

    _signOutAsync = async () => {
      await AsyncStorage.clear();
      this.props.navigation.navigate('Auth');
    };
  }
