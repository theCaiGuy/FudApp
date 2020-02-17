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
  'Mustard',
  '1oz. Philadelphia Cream Cheese',
  'Durian',
  'Dairy Queen Hot Dog',
  'White Bread',
  'Tequila',
  '24oz. Monster Energy',
  'Peppermint',
  '1oz. Dove Dark Chocolate'
]


function DishComponent({
  name,
  meal_num,
  ingredients,
  ingredientChange,
  dish_num,
}) {
  return (
    <Card 
      title={name}
      titleStyle={styles.left_align_subheader_text}
      dividerStyle={{width: 0}}
      containerStyle={{marginHorizontal: 0, marginVertical: 5}}
    >
      {
        ingredients.map((ingredient, i) => (
          <ListItem
            key={i}
            title={ingredient}
            bottomDivider
            topDivider={i === 0}
            chevron
            onPress={ingredientChange.bind(this, meal_num, dish_num, i, ingredient)}
          />
        ))
      }
    </Card>
  )
}

function MealComponent({
  num,
  dishes,
  ingredientChange,
}) {
  return (
    <Card title={"Meal #" + (num + 1)}>
      {
        dishes.map((dish, i) => (
          <DishComponent 
            name={dish.name} 
            ingredients={dish.ingredients} 
            key={i} 
            ingredientChange={ingredientChange}
            meal_num={num}
            dish_num={i}
          />
        ))
      }
    </Card>
  );
}

export class DailyScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      overlay_visible: false,
      date: '2020-02-16',
      meal_to_edit: null,
      dish_to_edit: null,
      ingredient_to_edit: null,
      ingredient_to_edit_name: null,
      DATA: {
        date: '2020-02-16',
        meals: [
          {
            num: '1',
            dishes: [
              {
                name: 'Scrambled egg whites with avocado',
                ingredients: [
                  'Egg whites',
                  '1/2 ripe avocado',
                  'Salt',
                  'Pepper',
                  'Hot Sauce',
                ]
              }
            ]
          },
          {
            num: '2',
            dishes: [
              {
                name: 'Chicken fried rice bowl',
                ingredients: [
                  'Chicken',
                  'Rice',
                  'Garlic',
                  'Green Onions',
                ]
              },
              {
                name: 'Plain non-fat Greek yogurt',
                ingredients: [
                  'Yogurt'
                ]
              }
            ]
          },
          {
            num: '3',
            dishes: [
              {
                name: 'Steak and Potatoes',
                ingredients: [
                  '6oz. Sirloin Steak',
                  '1 Idaho Potato',
                  '1oz. Butter',
                  'Salt',
                  'Pepper',
                ]
              },
              {
                name: 'Vanilla Ice Cream',
                ingredients: [
                  'Vanilla Ice Cream',
                ]
              }
            ]
          }
        ],
      }

    };
    this.openUpdateOverlay = this.openUpdateOverlay.bind(this)
    this.updateIngredient = this.updateIngredient.bind(this)
    this.quitOverlay = this.quitOverlay.bind(this)
  }
  
  openUpdateOverlay = async (meal_to_edit, dish_to_edit, ingredient_to_edit, ingredient_to_edit_name) => {
    await this.setState({
      overlay_visible: true,
      meal_to_edit: meal_to_edit,
      dish_to_edit: dish_to_edit,
      ingredient_to_edit: ingredient_to_edit,
      ingredient_to_edit_name: ingredient_to_edit_name
    })
  }

  updateIngredient = async (updatedIngredient) => {
    meal_to_edit = this.state.meal_to_edit
    dish_to_edit = this.state.dish_to_edit
    ingredient_to_edit = this.state.ingredient_to_edit
    var data = {... this.state.DATA}
    data.meals[meal_to_edit].dishes[dish_to_edit].ingredients[ingredient_to_edit] = updatedIngredient
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

      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <Text style={styles.central_header_text}>Your Füd Plan</Text>
            <Text style={styles.central_subheader_text}>{this.state.DATA.date}</Text>
            
            <View>
              {
                this.state.DATA.meals.map((meal, i) => (
                  <MealComponent 
                    num={i} 
                    dishes={meal.dishes} 
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
                    {"Don't like " + this.state.ingredient_to_edit_name + "? Replace with..."}
                  </Text>
                  <View>
                    {
                      ALTERNATE_INGREDIENTS.map((ingredient, i) => (
                        <ListItem
                          key={i}
                          title={ingredient}
                          bottomDivider
                          topDivider={i === 0}
                          chevron
                          onPress={this.updateIngredient.bind(this, ingredient)}
                        />
                      ))
                    }
                  </View>
                  <Button 
                    title="Nevermind" 
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
