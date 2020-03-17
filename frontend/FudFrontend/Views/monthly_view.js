import React, { Component, useState, useEffect } from 'react';
import {
  Animated,
  AsyncStorage,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { styles } from '../Styles/styles'
import CalendarPicker from 'react-native-calendar-picker';
import * as Progress from 'react-native-progress';
import { API_PATH } from '../assets/constants';
import {
  Button,
} from 'react-native-elements';
import {encode as btoa} from 'base-64';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';

/*
This view is a Calendar view that lets the user look at their meal plan for any
given day.
It also is a Progress tracker that lets them see how they are doing towards
their daily goal of calories, protein, carbs, and fat.
*/


/*
Display a progress bar for the selected macro

Arguments:
current_progress (float): Amount of the given macro consumed on the given date
max_progress (float): Recommended amount of the given macro to consume
animationSpeed (float): Time in seconds the component should fade in
macro_name (String): Name of the macro whose progress bar is being displayed
*/
function ProgressComponent({
  current_progress,
  max_progress,
  animationSpeed,
  macro_name,
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
      <View>
        <Text 
          style={styles.left_align_subheader_text}
        > 
          {`${macro_name}: ${(current_progress) ? current_progress : 0} / ${(max_progress) ? max_progress : 0}`}
        </Text>
      
        <View>
          {
            (current_progress === null || max_progress === null) ? (
              <Progress.Bar 
                style={styles.progress_bar} 
                progress={0} 
                width={null} 
                height={20}
                color={'#3b821b'}
              />
            ) : (
              <Progress.Bar 
                style={styles.progress_bar} 
                progress={Math.min(1.0, parseInt(current_progress, 10) / parseInt(max_progress, 10))} 
                width={null} 
                height={20}
                color={(parseInt(current_progress, 10) / parseInt(max_progress, 10) > 1.0) ? 'red' : '#3b821b'}
              />
            )
          }
        </View>
      </View>
    </Animated.View>
  );
}


/*
Main export class for the monthly progress view
*/
export class MonthScreen extends React.Component {
  constructor(props) {
    super(props);

    let curr_date = (new Date()).toISOString().slice(0, 10);

    this.state = {
      selectedDate: curr_date, // Date selected by the user in the calendar view
      curr_cals: null, // Current calories consumed by the user for the selected date
      max_cals: null, // Recommended calories to be consumed by the user
      curr_protein: null, // Current protein consumed by the user for the selected date
      max_protein: null, // Recommended protein to be consumed by the user
      curr_carbs: null, // Current carbs to be consumed by the user for the selected date
      max_carbs: null, // Recommended carbs to be consumed by the user
      curr_fat: null, // Current fat consumed by the user for the selected date
      max_fat: null, // Recommended fat to be consumed by the user
      no_data: false, // Flag to be set if there is no data for the selected date
    };
    this.onDateChange = this.onDateChange.bind(this);
    this.viewMeals = this.viewMeals.bind(this);
    this.fetchUserMacros = this.fetchUserMacros.bind(this);
  }

  /*
  Query API for expected user macro attainment based
  on the user's stated measurements and goals
  */
  fetchUserMacros = async() => {
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
            max_cals: Math.round(responseJson['tdee']),
            max_protein: Math.round(responseJson['protein']),
            max_carbs: Math.round(responseJson['carb']),
            max_fat: Math.round(responseJson['fat']),
          });
          console.log(`Recieved max response ${JSON.stringify(responseJson)}`);
        });
      });
    }).catch((error) => {
      // console.error(JSON.stringify(error));
    });
  }

  /*
  Get user's macro attainment for the given date
  */
  fetchMacroAttainment = async(curr_date) => {
    AsyncStorage.getItem('userToken').then((token) => {
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
          this.setState({
            no_data: true,
            curr_cals: 0,
            curr_protein: 0,
            curr_carbs: 0,
            curr_fat: 0,
            loading: false,
          })
          console.log(JSON.stringify(response2));
          return;
        }

        response2.json().then((responseJson2) => {
          this.setState({
            curr_cals: Math.round(responseJson2['calories']),
            curr_protein: Math.round(responseJson2['protein']),
            curr_carbs: Math.round(responseJson2['carb']),
            curr_fat: Math.round(responseJson2['fat']),
            no_data: false,
            loading: false,
          });
          console.log(`Recieved curr response ${JSON.stringify(responseJson2)}`);
        });
      });
    }).catch((error) => {
      // console.error(JSON.stringify(error));
    });
  }

  /*
  On mount, display macros for the specified date
  */
  componentDidMount() {
    let { params } = this.props.navigation.state;
    let date = params ? params.date : null;
    if (!date) {
      date = (new Date()).toISOString().slice(0, 10);
    }
    console.log(date);
    this.setState({
      selectedDate: date,
      loading: true,
    })
    this.fetchUserMacros();
    this.fetchMacroAttainment(date);
  }

  /*
  Callback function for when the user selects a date from the calendar
  */
  onDateChange = async(date) => {
    let curr_date = date.toISOString().slice(0, 10);
    this.setState({
      selectedDate: curr_date,
      loading: true,
    });
    this.fetchMacroAttainment(curr_date);
  }

  viewMeals = async () => {
    this.props.navigation.navigate('Home', {date: this.state.selectedDate});
  }

  static navigationOptions = {
    title: 'Your monthly progress',
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView>

          <View style={styles.calendarStyle}>
            <CalendarPicker
              onDateChange={this.onDateChange}
              selectedDayColor="#3b821b"
              selectedDayTextColor="#ffffff"
              initialDate={this.state.selectedDate}
            />
          </View>

          <View>
            {
              (this.state.loading) ? (
                <Text style={styles.central_subheader_text}>Loading...</Text>
              ) : (this.state.no_data) ? (
                <Text style={styles.central_subheader_text}> {`No data available: ${this.state.selectedDate}`} </Text>
              ) : (
                <Text style={styles.central_subheader_text}> {`Progress Tracking: ${this.state.selectedDate}`} </Text>
              )
            }
          </View>

          <ProgressComponent
            current_progress={this.state.curr_cals}
            max_progress={this.state.max_cals}
            animationSpeed={1}
            macro_name="Calories"
          />

          <ProgressComponent
            current_progress={this.state.curr_carbs}
            max_progress={this.state.max_carbs}
            animationSpeed={1.25}
            macro_name="Carbs"
          />

          <ProgressComponent
            current_progress={this.state.curr_fat}
            max_progress={this.state.max_fat}
            animationSpeed={1.5}
            macro_name="Fats"
          />

          <ProgressComponent
            current_progress={this.state.curr_protein}
            max_progress={this.state.max_protein}
            animationSpeed={1.75}
            macro_name="Protein"
          />
          
          <Button
            title={`${(this.state.no_data) ? ("Generate") : ("View")} Meals: ${this.state.selectedDate}`}
            onPress={this.viewMeals}
            buttonStyle={styles.nav_button}
            titleStyle={styles.nav_text}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
}
