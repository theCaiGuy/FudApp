import React, { Component } from 'react';
import {
    Text,
    Button,
    StatusBar,
    View,
    FlatList,
    CheckBox,
    Switch
} from 'react-native';
import { styles } from '../Styles/styles'

// HARD CODED DATA
// THIS SHOULD EVENTUALLY COME FROM OUR API
const DATA = {
  week: '2020-02-02',
  plan: [
    {
      date: 'Sunday',
      meals: [
        {
          num: '1',
          dishes: [
            {
              name: 'Scrambled egg whites with avocado',
              ingredients: [
                'Egg whites',
                '1/2 ripe avocado',
                'Salt & pepper',
                'Hot sauce'
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
                'Bowl'
              ]
            },
            {
              name: 'Plain non-fat Greek yogurt',
              ingredients: [
                'Yogurt'
              ]
            }
          ]
        }
      ]
    },
    {
      date: 'Monday',
      meals: [
        {
          num: '1',
          dishes: [
            {
              name: 'Toast',
              ingredients: [
                'Whole-wheat bread',
                'Butter'
              ]
            }
          ]
        }
      ]
    }
  ]
};

class Dish_Component extends Component {
  constructor(props) {
    super(props);
    this.state = { checked: false };
  }
  
  
  render() {
    return (
      <View>
        <View style={styles.meal}>
          <Text style={styles.meal_item_text}>{this.props.dish_name}:</Text>
          {/* this switch works but looks weird, need to chat on it */}
          {/* <Switch value={ this.state.checked }
                  onValueChange={() => this.setState({ checked: !this.state.checked })}/> */}
        </View>
        <FlatList
          data={this.props.ingredients}
          renderItem={({ item }) => <Text style={styles.meal_item_text}>{`\u2022`} {item}</Text>}
          keyExtractor={(item, index) => 'key' + index}
        />
      </View>
    );
  };
}

function Meal_Component({
  num,
  dishes
}) {
  return (
    <View style={styles.meal_item}
      >
      <Text style={styles.meal_item_text}>Meal {num}:</Text>
      <FlatList
        data={dishes}
        renderItem={({ item }) => <Dish_Component
          dish_name={item.name}
          ingredients={item.ingredients}
          />}
        keyExtractor={(item, index) => 'key' + index}
      />
    </View>
  );
}

function Daily_Meals_Component({
  date,
  meals
}) {
  return (
    <View
      style={styles.meal_date_item}>
      <Text style={styles.meal_date}>{date}</Text>
      <FlatList
        data={meals}
        renderItem={({ item }) => <Meal_Component
          num = {item.num}
          dishes = {item.dishes}
          />}
        keyExtractor={(item, index) => 'key' + index}
      />
    </View>
  );
}

export class DetailScreen extends React.Component {
    static navigationOptions = {
      title: 'Weekly Füd Plan',
    };

    render() {
      return (
        <View style={styles.container}>
          <Text style={styles.central_header_text}>Week of {DATA.week}:</Text>
          <FlatList
            data={DATA.plan}
            renderItem={({ item }) => <Daily_Meals_Component
              date = {item.date}
              meals = {item.meals}
              />}
            keyExtractor={(item, index) => 'key' + index}
          />
          
          <Button title="Back to Home" onPress={this._goHomeAsync} />
          <StatusBar barStyle="default" />
        </View>
      );
    }

    _goHomeAsync = async () => {
      this.props.navigation.navigate('Home');
    };
  }
