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
} from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'


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

    };
    this.openUpdateOverlay = this.openUpdateOverlay.bind(this)
    this.updateIngredient = this.updateIngredient.bind(this)
    this.quitOverlay = this.quitOverlay.bind(this)
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

      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <Text style={styles.central_header_text}>Your Füd Plan</Text>
            <Text style={styles.central_subheader_text}>{this.state.date}</Text>
            
            <View>
              {
                Object.keys(this.state.DATA).map((meal, i) => (
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
                      Object.keys(this.state.DATA[this.state.meal_to_edit][this.state.food_to_edit]).slice(2).map((fact, i) => (
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
                    {"Don't like " + this.state.food_to_edit_name + "? Here are similar foods!"}
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
