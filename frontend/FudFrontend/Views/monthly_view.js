import React from 'react';
import {
  AsyncStorage,
  Button,
  FlatList,
  SafeAreaView,
  Text,
  TouchableHighlight,
  View,
  StyleSheet,
} from 'react-native';
import { styles } from '../Styles/styles'
import CalendarPicker from 'react-native-calendar-picker';
import * as Progress from 'react-native-progress';

// HARD CODED DATA
// THIS SHOULD EVENTUALLY COME FROM OUR API
const DATA = [
  {
    date: '2020-02-02',
    protein: 88,
    carbs: 85,
    fat: 100,
  },
  {
    date: '2020-01-26',
    protein: 100,
    carbs: 200,
    fat: 120,
  },
  {
    date: '2020-01-09',
    protein: 112,
    carbs: 205,
    fat: 100,
  },
  {
    date: '2020-01-12',
    protein: 0,
    carbs: 25,
    fat: 69,
  },
];


function Day_Component({
  date,
  protein,
  carbs,
  fat,
  meal_button_async
}) {
  var protein_progress = protein / 175
  var carb_progress = carbs / 135
  var fat_progress = fat / 135

  return (
    <TouchableHighlight
      style={styles.info_item}
      onPress={meal_button_async}
    >
      <View>
        <Text style={styles.title}>Week of {date}</Text>
        <Text style={styles.detail}>Protein: {protein}/175 g</Text>
        <Progress.Bar progress={protein_progress} width={null} height={8} color={'white'}/>
        <Text style={styles.detail}>Carbs: {carbs}/135 g</Text>
        <Progress.Bar progress={carb_progress} width={null} height={8} color={'white'}/>
        <Text style={styles.detail}>Fat: {fat}/135 g</Text>
        <Progress.Bar progress={fat_progress} width={null} height={8} color={'white'}/>
      </View>
    </TouchableHighlight>
  );
}


export class MonthScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStartDate: null,
    };
    this.onDateChange = this.onDateChange.bind(this);
  }

  onDateChange(date) {
    this.setState({
      selectedStartDate: date,
    });
  }

  static navigationOptions = {
    title: 'Your monthly progress',
  };

  render() {
    const { selectedStartDate } = this.state;
    const startDate = selectedStartDate ? selectedStartDate.toString() : '';
    return (
      <SafeAreaView style={styles.container}>
        <CalendarPicker
          onDateChange={this.onDateChange}
        />

        <View>
          <Text>SELECTED DATE:{ startDate }</Text>
        </View>

        <Button title="Sign Out of Füd" onPress={this._signOutAsync} />
      </SafeAreaView>
    );
  }

  _showMoreAppAsync = () => {
    this.props.navigation.navigate('Detail');
  };

  _changePrefsAsync = () => {
    this.props.navigation.navigate('Prefs');
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };
}
