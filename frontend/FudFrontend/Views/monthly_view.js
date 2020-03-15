import React from 'react';
import {
  AsyncStorage,
  SafeAreaView,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { styles } from '../Styles/styles'
import CalendarPicker from 'react-native-calendar-picker';
import * as Progress from 'react-native-progress';
import { API_PATH } from '../assets/constants';
import {
  Button,
  Card,
  Input,
  ListItem,
  Overlay,
  Slider,
} from 'react-native-elements';
import {encode as btoa} from 'base-64';

/*
This view is a Calendar view that lets the user look at their meal plan for any
given day.
It also is a Progress tracker that lets them see how they are doing towards
their daily goal of calories, protein, carbs, and fat.
*/

export class MonthScreen extends React.Component {
  constructor(props) {
    super(props);

    let curr_date = (new Date()).toISOString().slice(0, 10);

    this.state = {
      selectedDate: curr_date,
      curr_cals: null,
      max_cals: null,
      curr_protein: null,
      max_protein: null,
      curr_carbs: null,
      max_carbs: null,
      curr_fat: null,
      max_fat: null,
    };
    this.onDateChange = this.onDateChange.bind(this);
    this.viewMeals = this.viewMeals.bind(this);
  }

  onDateChange = async(date) => {
    let curr_date = date.toISOString().slice(0, 10);
    this.setState({
      selectedDate: curr_date,
    });

    AsyncStorage.getItem('userToken').then((token) => {
      // GET MAX CALS, PROTEIN, CARBS, AND FAT
      fetch(`http://${API_PATH}/api/users/goals/fetch_user_macros`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${token}:`)}`
        },
      })
      .then((response) => {
        if (response.status === 401) {
          AsyncStorage.removeItem('userToken').then(() => {
            this.props.navigation.navigate('Auth');
            return;
          });
        }
        if (response.status === 400) {
          {/*
            TODO: Handle 400 response better
          */}
          console.log(JSON.stringify(response));
          return;
        }

        response.json().then((responseJson) => {
          this.setState({
            // selectedDate: curr_date,
            max_cals: Math.round(responseJson['tdee']),
            max_protein: Math.round(responseJson['protein']),
            max_carbs: Math.round(responseJson['carb']),
            max_fat: Math.round(responseJson['fat']),
          });
          console.log(`Recieved max response ${JSON.stringify(responseJson)}`);
        });
      });

      // GET CURRENT CALS, PROTEIN, CARBS, AND FAT
      fetch(`http://${API_PATH}/api/users/history/fetch_user_history_macros_daily`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${token}:`)}`
        },
        body: JSON.stringify({"date": curr_date})
      })
      .then((response2) => {
        if (response2.status === 401) {
          AsyncStorage.removeItem('userToken').then(() => {
            this.props.navigation.navigate('Auth');
            return;
          });
        }
        if (response2.status === 400) {
          {/*
            TODO: Handle 400 response better
          */}
          console.log(JSON.stringify(response2));
          return;
        }

        response2.json().then((responseJson2) => {
          this.setState({
            curr_cals: Math.round(responseJson2['calories']),
            curr_protein: Math.round(responseJson2['protein']),
            curr_carbs: Math.round(responseJson2['carb']),
            curr_fat: Math.round(responseJson2['fat']),
          });
          console.log(`Recieved curr response ${JSON.stringify(responseJson2)}`);
        });
      });
    }).catch((error) => {
      console.error(JSON.stringify(error));
    });

  }

  viewMeals = async () => {
    this.props.navigation.navigate('Home', {date: this.state.selectedDate});
  }

  static navigationOptions = {
    title: 'Your monthly progress',
  };

  render() {
    const { selectedDate } = this.state;
    const startDate = selectedDate ? selectedDate.toString() : '';
    return (
      <SafeAreaView style={styles.container}>
        <CalendarPicker
          onDateChange={this.onDateChange}
          selectedDayColor="#3b821b"
          selectedDayTextColor="#ffffff"
        />

        <Button
          title={`View Meals: ${this.state.selectedDate}`}
          onPress={this.viewMeals}
          buttonStyle={styles.nav_button}
          titleStyle={styles.nav_text}
        />

        <Text style={styles.left_align_subheader_text}> Progress Tracking </Text>

        <Text style={styles.progress_text}> Calories: {this.state.curr_cals} / {this.state.max_cals}</Text>
        {
          this.state.curr_cals === null || this.state.max_cals === null
          ?
          <Progress.Bar style={styles.progress_bar} progress={0} width={200} />
          :
          parseInt(this.state.curr_cals, 10) / parseInt(this.state.max_cals, 10) > 1.0
          ?
          <Progress.Bar style={styles.progress_bar} progress={1.0} width={200} color={'red'}/>
          :
          <Progress.Bar style={styles.progress_bar} progress={Math.min(1.0, parseInt(this.state.curr_cals, 10) / parseInt(this.state.max_cals, 10))} width={200} color={'green'}/>
        }

        <Text style={styles.progress_text}> Protein: {this.state.curr_protein} / {this.state.max_protein}</Text>
        {
          this.state.curr_protein === null || this.state.max_protein === null
          ?
          <Progress.Bar style={styles.progress_bar} progress={0} width={200} />
          :
          parseInt(this.state.curr_protein, 10) / parseInt(this.state.max_protein, 10) > 1.0
          ?
          <Progress.Bar style={styles.progress_bar} progress={1.0} width={200} color={'red'}/>
          :
          <Progress.Bar style={styles.progress_bar} progress={Math.min(1.0, parseInt(this.state.curr_protein, 10) / parseInt(this.state.max_protein, 10))} width={200} color={'green'}/>
        }

        <Text style={styles.progress_text}> Carbs: {this.state.curr_carbs} / {this.state.max_carbs}</Text>
        {
          this.state.curr_carbs === null || this.state.max_carbs === null
          ?
          <Progress.Bar style={styles.progress_bar} progress={0} width={200} />
          :
          parseInt(this.state.curr_carbs, 10) / parseInt(this.state.max_carbs, 10) > 1.0
          ?
          <Progress.Bar style={styles.progress_bar} progress={1.0} width={200} color={'red'}/>
          :
          <Progress.Bar style={styles.progress_bar} progress={Math.min(1.0, parseInt(this.state.curr_carbs, 10) / parseInt(this.state.max_carbs, 10))} width={200} color={'green'}/>
        }

        <Text style={styles.progress_text}> Fat: {this.state.curr_fat} / {this.state.max_fat}</Text>
        {
          this.state.curr_fat === null || this.state.max_fat === null
          ?
          <Progress.Bar style={styles.progress_bar} progress={0} width={200} />
          :
          parseInt(this.state.curr_fat, 10) / parseInt(this.state.max_fat, 10) > 1.0
          ?
          <Progress.Bar style={styles.progress_bar} progress={1.0} width={200} color={'red'}/>
          :
          <Progress.Bar style={styles.progress_bar} progress={Math.min(1.0, parseInt(this.state.curr_fat, 10) / parseInt(this.state.max_fat, 10))} width={200} color={'green'}/>
        }

      </SafeAreaView>
    );
  }
}
