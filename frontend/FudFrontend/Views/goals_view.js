import React from 'react';
import {
  AsyncStorage,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import { styles } from '../Styles/styles'
import {
  Button,
  ButtonGroup,
  Input,
} from 'react-native-elements'
import { API_PATH } from '../assets/constants'


const ACTIVITY_LEVELS = [
  'Sedentary',
  'Light',
  'Moderate',
  'Heavy',
  'Athlete',
]

const GOALS = [
  'Cut',
  'Bulk',
  'Maintain',
]

const SEXES = [
  'NA',
  'M',
  'F',
]


function CalculationsComponent({
  fields_filled,
  loading,
  calories,
  fat,
  carbs,
  protein,
}) {
  if (!fields_filled) {
    return(
      <Text style={styles.satisfy_requirements_text}>Please fill in all required fields</Text>
    );
  }

  if (loading) {
    return(
      <Text style={styles.central_subheader_text}>Calculating...</Text>
    );
  }

  return(
    <View>
      <Text style={styles.left_align_subheader_text}>
        Calculations:
      </Text>
      <Text style={styles.left_align_subheader_text}>
        {"Calories per day: " + Math.round(calories)}
      </Text>
      <Text style={styles.left_align_subheader_text}>
        {"Carbs per day: " + Math.round(carbs) + " g"}
      </Text>
      <Text style={styles.left_align_subheader_text}>
        {"Fats per day: " + Math.round(fat) + " g"}
      </Text>
      <Text style={styles.left_align_subheader_text}>
        {"Protein per day: " + Math.round(protein) + " g"}
      </Text>
    </View>
  );
}


export class GoalsScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        fitness_goal: "Cut",
        activity_level: "Sedentary",
        sex: "NA",
        sex_index: 0,
        activity_index: 0,
        fitness_index: 0,
        height: null,
        weight: null,
        age: null,
        kgs_to_gain: null,
        weeks_to_goal: null,
        fields_filled: false,
        loading: false,
        goals_set: false,
        user_id: 1,
        rec_carbs: null,
        rec_fat: null,
        rec_protein: null,
        rec_calories: null,
      };
      this.updateSexIndex = this.updateSexIndex.bind(this)
      this.updateActivityIndex = this.updateActivityIndex.bind(this)
      this.updateFitnessIndex = this.updateFitnessIndex.bind(this)
      this.calculatePlan = this.calculatePlan.bind(this)
    }

    static navigationOptions = {
      title: 'Set Fitness Goals',
    };

    updateSexIndex (sex_index) {
      this.setState({sex_index});
      this.setState({sex: SEXES[sex_index]})
      console.log(`user sex set to ${SEXES[sex_index]}`)
    }

    updateActivityIndex (activity_index) {
      this.setState({activity_index});
      this.setState({activity_level: ACTIVITY_LEVELS[activity_index]})
      console.log(`user activity level set to ${ACTIVITY_LEVELS[activity_index]}`)
    }

    updateFitnessIndex (fitness_index) {
      this.setState({fitness_index});
      this.setState({fitness_goal: GOALS[fitness_index]})
      AsyncStorage.setItem('user_goal', GOALS[fitness_index])
      console.log(`user goal level set to ${GOALS[fitness_index]}`)
    }

    calculatePlan () {
      height = this.state.height
      weight = this.state.weight
      age = this.state.age
      kgs_to_gain = this.state.kgs_to_gain
      weeks_to_goal = this.state.weeks_to_goal
      if (height && weight && age && kgs_to_gain && weeks_to_goal) {
        console.log("Great!")
        this.setState({
          fields_filled: true,
          goals_set: true,
          loading: true,
        })
        fetch(`http://${API_PATH}/goals/set_user_info?user_id=${this.state.user_id}&age=${this.state.age}&height=${this.state.height}&weight=${this.state.weight}&sex=${this.state.sex}&activity=${this.state.activity_level}&goal=${this.state.fitness_goal}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })
        .then((response) => {
          console.log(JSON.stringify(response))
        })
        .catch((error) => {
          console.error(error)
        })

        fetch(`http://${API_PATH}/goals/fetch_user_macros?user_id=${this.state.user_id}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(JSON.stringify(responseJson));
          this.setState({
            rec_carbs: responseJson.carbs,
            rec_fat: responseJson.fat,
            rec_protein: responseJson.protein,
            rec_calories: responseJson.tdee,
            loading: false,
          })
        })
        .catch((error) => {
          console.error(error)
        })
      } else {
        console.log("Fields not filled")
        this.setState({fields_filled: false})
      }
    }

    render() {
      const sex_buttons = ['Not Specified', 'Male', 'Female']
      const activity_buttons = ['1', '2', '3', '4', '5']
      const fitness_buttons = ['Fat Loss', 'Muscle Gain', 'Maintenance']

      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <View style={styles.container}>

              <Input
                label = 'Height'
                labelStyle={styles.profile_text_input_label}
                containerStyle={styles.profile_text_input}
                placeholder = 'Your Height in Centimeters'
                keyboardType='numeric'
                onChangeText = {(text) => this.setState({height: text})}
              />

              <Input
                label = 'Weight'
                labelStyle={styles.profile_text_input_label}
                containerStyle={styles.profile_text_input}
                placeholder = 'Your Weight in Kilograms'
                keyboardType='numeric'
                onChangeText = {(text) => this.setState({weight: text})}
              />

              <Input
                label = 'Age'
                labelStyle={styles.profile_text_input_label}
                containerStyle={styles.profile_text_input}
                placeholder = 'Your Age in Years'
                keyboardType='numeric'
                onChangeText = {(text) => this.setState({age: text})}
              />

              <Text style={styles.left_align_subheader_text}>
                Sex
              </Text>

              <ButtonGroup
                onPress={this.updateSexIndex}
                selectedIndex={this.state.sex_index}
                buttons={sex_buttons}
                containerStyle={styles.button_group_style}
                selectedButtonStyle={styles.goal_selection_button}
              />

              <Text style={styles.left_align_subheader_text}>
                Activity level
              </Text>

              <ButtonGroup
                onPress={this.updateActivityIndex}
                selectedIndex={this.state.activity_index}
                buttons={activity_buttons}
                containerStyle={styles.button_group_style}
                selectedButtonStyle={styles.goal_selection_button}
              />

              <Text style={styles.left_align_subheader_text}>
                Fitness Goals
              </Text>

              <ButtonGroup
                onPress={this.updateFitnessIndex}
                selectedIndex={this.state.fitness_index}
                buttons={fitness_buttons}
                containerStyle={styles.button_group_style}
                selectedButtonStyle={styles.goal_selection_button}
              />

              <Input
                label = 'Number of kilograms to lose/gain'
                labelStyle={styles.profile_text_input_label}
                containerStyle={styles.profile_text_input}
                placeholder='Kilograms to lose/gain'
                keyboardType='numeric'
                onChangeText = {(text) => this.setState({kgs_to_gain: text})}
              />

              <Input
                label = 'Number of weeks to achieve goal'
                labelStyle={styles.profile_text_input_label}
                containerStyle={styles.profile_text_input}
                placeholder='Weeks to achieve goal'
                keyboardType='numeric'
                onChangeText = {(text) => this.setState({weeks_to_goal: text})}
              />

              <Button
                title="Set Fitness Goals!"
                onPress={this.calculatePlan}
                buttonStyle={styles.sign_in_button}
                titleStyle={styles.title}
              />

              <CalculationsComponent
                fields_filled = {this.state.fields_filled}
                loading = {this.state.loading}
                calories = {this.state.rec_calories}
                fat = {this.state.rec_fat}
                carbs = {this.state.rec_carbs}
                protein = {this.state.rec_protein}
              />


              <Button
                title="Looks Good to Me!"
                onPress={this._setFudPrefsAsync}
                buttonStyle={styles.sign_in_button}
                titleStyle={styles.title}
                disabled={!this.state.goals_set}
              />
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      );
    }

    _setFudPrefsAsync = () => {
      this.props.navigation.navigate('Prefs');
    };

  }
