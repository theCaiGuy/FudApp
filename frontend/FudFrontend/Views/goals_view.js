import React, { useState } from 'react';
import {
  Animated,
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
  Card,
  CheckBox,
  Input,
  ListItem,
} from 'react-native-elements'
import { API_PATH } from '../assets/constants'
import {encode as btoa} from 'base-64'

/*
This view lets users enter information about their current physical
state/health, and then enter specific fat loss or muscle gain goals with
a specific timeline. The app then uses API calls to calculate exactly how
many calories (and more specifically, how many grams of protein, fat, carbs)
the user should eat per day on average in order to reach their goal within the
specified timeline.

TODO:
(1) Make the fat loss / muscle gain goal picking section clearer; some users might
not understand that the two are usually mutually exlucisve.
(2) Allow for imperial system inputs. DONE (on frontend)
(3) Add routing with user profile view.
*/

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

const MEASUREMENTS = [
  'Metric',
  'Imperial',
]

const DIETARY_RESTRICTIONS = [
  'Vegan',
  'Vegetarian',
  'Pescatarian',
  'No Red Meat',
  'No Pork',
  'No Beef',
  'Nut Allergy',
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

  const [fadeAnim] = useState(new Animated.Value(0))  // Initial value for opacity: 0

  React.useEffect(() => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 1000,
      }
    ).start();
  }, [])

  return(
    <Animated.View
      style={{
        opacity: fadeAnim,
        marginBottom: 15,
      }}
    >
      <Card
        title={"Your Calculations:"}
        titleStyle={styles.left_align_subheader_text}
        dividerStyle={{width: 0}}
      >
        <ListItem
          title={"Calories per day: " + Math.round(calories)}
          bottomDivider
          topDivider
        />
        <ListItem
          title={"Carbs per day: " + Math.round(carbs) + " g"}
          bottomDivider
        />
        <ListItem
          title={"Fats per day: " + Math.round(fat) + " g"}
          bottomDivider
        />
        <ListItem
          title={"Protein per day: " + Math.round(protein) + " g"}
          bottomDivider
        />
      </Card>
    </Animated.View>
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
        measurement_index: 0,
        measurement_system: "Metric",
        height: null,
        weight: null,
        age: null,
        kgs_to_gain: null,
        weeks_to_goal: null,
        fields_filled: false,
        page_loading: true,
        loading: false,
        goals_set: false,
        user_id: 1,
        rec_carbs: null,
        rec_fat: null,
        rec_protein: null,
        rec_calories: null,
        dietary_restrictions: [],
        weight_to_change: null,
        weeks_to_goal: null,
      };
      this.updateSexIndex = this.updateSexIndex.bind(this)
      this.updateActivityIndex = this.updateActivityIndex.bind(this)
      this.updateFitnessIndex = this.updateFitnessIndex.bind(this)
      this.calculatePlan = this.calculatePlan.bind(this)
      this.updateMeasurementIndex = this.updateMeasurementIndex.bind(this)
    }

    static navigationOptions = {
      title: 'Set Fitness Goals',
    };

    componentDidMount() {
      return AsyncStorage.getItem('userToken').then((token) => {
        fetch(`http://${API_PATH}/api/users/goals/fetch_user_info`, {
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
            this.setState({
              page_loading: false,
            })
            {/*
              TODO: Handle 400 response better
            */}
            return;
          }
          if (response.status !== 200) {
            this.setState({
              page_loading: false,
            })
            {/*
              TODO: Handle 400 response better
            */}
            return;
          }
          response.json().then((responseJson) => {
            this.setState({
              activity_level: responseJson['activity'],
              age: responseJson['age'],
              fitness_goal: responseJson['goal'],
              height: responseJson['height'],
              sex: responseJson['sex'],
              weight: responseJson['weight'],
              page_loading: false,
              sex_index: SEXES.indexOf(responseJson['sex']),
              fitness_index: GOALS.indexOf(responseJson['goal']),
              activity_index: ACTIVITY_LEVELS.indexOf(responseJson['activity']),
              dietary_restrictions: (responseJson['restrictions']) ? responseJson['restrictions'] : [],
              measurement_system: (responseJson['measurement_system']) ? responseJson['measurement_system'] : 'Metric',
              weight_to_change: (responseJson['weight_to_change']) ? responseJson['weight_to_change'] : 0,
              weeks_to_goal: (responseJson['weeks_to_goal']) ? responseJson['weeks_to_goal'] : 0,
            });
            console.log(`Recieved response ${JSON.stringify(responseJson)}`);

            if (this.state.height && this.state.weight && this.state.age && (!this.state.fitness_goal !== "Maintain" && this.state.weight_to_change && this.state.weeks_to_goal || this.state.fitness_goal === "Maintain")) {
              this.setState({
                fields_filled: true
              })
              this.calculatePlan()
            }

          });
        })
      }).catch((error) => {
        console.error(error);
      });
    }

    updateMeasurementIndex (measurement_index) {
      let height = this.state.height
      let weight = this.state.weight
      let weight_to_change = this.state.weight_to_change
      if (height && weight && weight_to_change) {
        if (MEASUREMENTS[measurement_index] == "Imperial" && this.state.measurement_system == "Metric") {
          this.setState({
            height: Math.round(height * 0.39370),
            weight: Math.round(weight * 2.20462),
            weight_to_change: Math.round(weight_to_change * 2.20462),
          })
        }
        if (MEASUREMENTS[measurement_index] == "Metric" && this.state.measurement_system == "Imperial") {
          this.setState({
            height: Math.round(height * 2.54),
            weight: Math.round(weight * 0.453592),
            weight_to_change: Math.round(weight_to_change * 0.453592)
          })
        }
      }
      this.setState({measurement_index})
      this.setState({measurement_system: MEASUREMENTS[measurement_index]})
      console.log(`user measurement set to ${MEASUREMENTS[measurement_index]}`)
    }

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
      if (GOALS[fitness_index] == "Maintain") {
        this.setState({
          weight_to_change: 0,
          weeks_to_goal: 0
        })
      }
      AsyncStorage.setItem('user_goal', GOALS[fitness_index])
      console.log(`user goal level set to ${GOALS[fitness_index]}`)
    }

    updateDietaryRestrictions (restriction) {
      let restrictions = [...this.state.dietary_restrictions];
      if (restrictions.includes(restriction)) {
        restrictions.splice( restrictions.indexOf(restriction), 1 )
        this.setState({
          dietary_restrictions: restrictions
        });
      } else {
        restrictions.push(restriction)
        this.setState({
          dietary_restrictions: restrictions
        })
      }
      console.log(`user dietary restrictions set to [${restrictions}]`)
    }

    calculatePlan = async () => {
      if (this.state.height && this.state.weight && this.state.age && (this.state.fitness_goal !== "Maintain" && this.state.weight_to_change && this.state.weeks_to_goal || this.state.fitness_goal === "Maintain")) {
        console.log("All fields filled!")
        await this.setState({
          fields_filled: true,
          loading: true,
        })

        try {
          const token = await AsyncStorage.getItem("userToken");
          const set_res = await fetch(`http://${API_PATH}/api/users/goals/set_user_info`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(`${token}:`)}`
            },
            body: JSON.stringify({
              "age": this.state.age,
              "height": this.state.height,
              "weight": this.state.weight,
              "sex": this.state.sex,
              "activity": this.state.activity_level,
              "goal": this.state.fitness_goal,
              "restrictions": this.state.dietary_restrictions,
              "measurement_system": this.state.measurement_system,
              "weight_to_change": this.state.weight_to_change,
              "weeks_to_goal": this.state.weeks_to_goal,
            })
          });
          if (set_res.status === 401) {
            await AsyncStorage.removeItem('userToken').then(() => {
              this.props.navigation.navigate('Auth');
              return;
            });
          };

          console.log(JSON.stringify(set_res));

          const fetch_res = await fetch(`http://${API_PATH}/api/users/goals/fetch_user_macros`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(`${token}:`)}`
            },
          });
          if (fetch_res.status === 401) {
            await AsyncStorage.removeItem('userToken').then(() => {
              this.props.navigation.navigate('Auth');
              return;
            });
          };
          const content = await fetch_res.json();
          console.log(JSON.stringify(content));
          this.setState({
            rec_carbs: content.carb,
            rec_fat: content.fat,
            rec_protein: content.protein,
            rec_calories: content.tdee,
            loading: false,
            goals_set: true,
          });
        } catch (err) {
          console.error(err);
        }
      } else {
        console.log("Fields not filled")
        this.setState({fields_filled: false})
      }
    }

    _setFudPrefsAsync = async () => {
      if (this.state.height && this.state.weight && this.state.age && (this.state.fitness_goal !== "Maintain" && this.state.weight_to_change && this.state.weeks_to_goal || this.state.fitness_goal === "Maintain")) {
        console.log("All fields filled!")
        await this.setState({
          fields_filled: true,
        })

        try {
          const token = await AsyncStorage.getItem("userToken");
          const set_res = await fetch(`http://${API_PATH}/api/users/goals/set_user_info`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(`${token}:`)}`
            },
            body: JSON.stringify({
              "age": this.state.age,
              "height": this.state.height,
              "weight": this.state.weight,
              "sex": this.state.sex,
              "activity": this.state.activity_level,
              "goal": this.state.fitness_goal,
              "restrictions": this.state.dietary_restrictions,
              "measurement_system": this.state.measurement_system,
              "weight_to_change": this.state.weight_to_change,
              "weeks_to_goal": this.state.weeks_to_goal,
            })
          });
          if (set_res.status === 401) {
            await AsyncStorage.removeItem('userToken').then(() => {
              this.props.navigation.navigate('Auth');
              return;
            });
          };

          console.log(JSON.stringify(set_res));
          this.props.navigation.navigate('Prefs');
        } catch (err) {
          console.error(err);
        }
      } else {
        console.log("Fields not filled")
        this.setState({fields_filled: false})
      }
    };

    render() {
      const sex_buttons = ['Not Specified', 'Male', 'Female']
      const activity_buttons = ['1', '2', '3', '4', '5']
      const fitness_buttons = ['Fat Loss', 'Muscle Gain', 'Maintenance']

      if (this.state.page_loading) {
        return (
          <SafeAreaView style={styles.container}>
            <Text style={styles.central_subheader_text}>Loading Fitness Goals...</Text>
          </SafeAreaView>
        )
      }

      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <View style={styles.container}>

              <Text style={styles.left_align_subheader_text}>
                Measurement Units
              </Text>

              <ButtonGroup
                onPress={this.updateMeasurementIndex}
                selectedIndex={this.state.measurement_index}
                buttons={MEASUREMENTS}
                containerStyle={styles.button_group_style}
                selectedButtonStyle={styles.goal_selection_button}
              />

              <Input
                label = {(this.state.measurement_system == "Metric") ? "Height in Centimeters" : "Height in Inches"}
                labelStyle={styles.profile_text_input_label}
                containerStyle={styles.profile_text_input}
                placeholder = 'Your Height'
                keyboardType='numeric'
                onChangeText = {(text) => this.setState({height: text})}
                defaultValue={(this.state.height) ? String(this.state.height) : ""}
              />

              <Input
                label = {(this.state.measurement_system == "Metric") ? "Weight in Kilograms" : "Weight in Pounds"}
                labelStyle={styles.profile_text_input_label}
                containerStyle={styles.profile_text_input}
                placeholder = 'Your Weight'
                keyboardType='numeric'
                onChangeText = {(text) => this.setState({weight: text})}
                defaultValue={(this.state.weight) ? String(this.state.weight) : ""}
              />

              <Input
                label = 'Age'
                labelStyle={styles.profile_text_input_label}
                containerStyle={styles.profile_text_input}
                placeholder = 'Your Age'
                keyboardType='numeric'
                onChangeText = {(text) => this.setState({age: text})}
                defaultValue={(this.state.age) ? String(this.state.age) : ""}
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

              <View>
                {
                  (this.state.fitness_goal === "Cut" || this.state.fitness_goal == "Bulk") ? (
                    <View>
                      <Input
                        label = {
                          (this.state.measurement_system === "Metric" && this.state.fitness_goal === "Bulk") ? "Kilograms to gain"
                          : (this.state.measurement_system === "Imperial" && this.state.fitness_goal === "Bulk") ? "Pounds to gain"
                          : (this.state.measurement_system === "Metric" && this.state.fitness_goal === "Cut") ? "Kiliograms to lose"
                          : "Pounds to lose"
                        }
                        labelStyle={styles.profile_text_input_label}
                        containerStyle={styles.profile_text_input}
                        placeholder='Kilograms to lose/gain'
                        keyboardType='numeric'
                        onChangeText = {(text) => this.setState({weight_to_change: text})}
                        defaultValue={(this.state.weight_to_change) ? String(this.state.weight_to_change) : ""}
                      />

                      <Input
                        label = 'Weeks to achieve goal'
                        labelStyle={styles.profile_text_input_label}
                        containerStyle={styles.profile_text_input}
                        placeholder='Weeks to achieve goal'
                        keyboardType='numeric'
                        onChangeText = {(text) => this.setState({weeks_to_goal: text})}
                        defaultValue={(this.state.weeks_to_goal) ? String(this.state.weeks_to_goal) : ""}
                      />
                    </View>
                  ) : (
                    <View/>
                  )
                }
              </View>

              <View>
                {
                  (
                    this.state.weight_to_change 
                    && this.state.weeks_to_goal 
                    && this.state.measurement_system === "Metric" 
                    && (this.state.weight_to_change / this.state.weeks_to_goal > 1)
                  ) ? (
                    <Text style={styles.satisfy_requirements_text}>{`Warning: Please consult a doctor before attempting to ${(this.state.fitness_goal === "Bulk") ? "gain" : "lose"} more than 1 kg per week as this may be detrimental to your health`}</Text>
                  ) : (
                    this.state.weight_to_change 
                    && this.state.weeks_to_goal 
                    && this.state.measurement_system === "Imperial" 
                    && (this.state.weight_to_change / this.state.weeks_to_goal > 2)
                  ) ? (
                    <Text style={styles.satisfy_requirements_text}>{`Warning: Please consult a doctor before attempting to ${(this.state.fitness_goal === "Bulk") ? "gain" : "lose"} more than 2 lbs per week as this may be detrimental to your health`}</Text>
                  ) : (
                    <View />
                  )
                }
              </View>

              <Text style={styles.left_align_subheader_text}>Dietary Restrictions</Text>

              <View>
                {
                  DIETARY_RESTRICTIONS.map((l, i) => (
                    <CheckBox
                      title={l}
                      checked={this.state.dietary_restrictions.includes(l)}
                      checkedColor='#3b821b'
                      onPress={this.updateDietaryRestrictions.bind(this, l)}
                      key={i}
                    />
                  ))
                }
              </View>

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

  }
