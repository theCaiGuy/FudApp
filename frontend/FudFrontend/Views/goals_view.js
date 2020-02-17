import React from 'react';
import {
    View,
    SafeAreaView,
    Text,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import { styles } from '../Styles/styles'
import {
  Button,
  ButtonGroup,
  Input,
} from 'react-native-elements'

export class GoalsScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        fitness_goal: "Fat Loss",
        activity_level: "Sedentary",
        sex: "Not Specified",
        sex_index: 0,
        activity_index: 0,
        fitness_index: 0,
      };
      this.updateSexIndex = this.updateSexIndex.bind(this)
      this.updateActivityIndex = this.updateActivityIndex.bind(this)
      this.updateFitnessIndex = this.updateFitnessIndex.bind(this)
    }

    static navigationOptions = {
      title: 'Set Fitness Goals',
    };

    updateSexIndex (sex_index) {
      this.setState({sex_index});
      if (sex_index == 0) {
        this.setState({sex : "Not Specified"});
      } else if (sex_index == 1) {
        this.setState({sex : "Male"});
      } else if (sex_index == 2) {
        this.setState({sex: "Female"});
      }
    }

    updateActivityIndex (activity_index) {
      this.setState({activity_index});
      if (activity_index == 0) {
        this.setState({activity_level : "Sedentary"});
      } else if (activity_index == 1) {
        this.setState({activity_level : "Moderate"});
      } else if (activity_index == 2) {
        this.setState({activity_level: "Athlete"});
      }
    }

    updateFitnessIndex (fitness_index) {
      this.setState({fitness_index});
      if (fitness_index == 0) {
        this.setState({fitness_goal : "Fat Loss"});
      } else if (fitness_index == 1) {
        this.setState({fitness_goal : "Muscle Gain"});
      } else if (fitness_index == 2) {
        this.setState({fitness_goal: "Maintenance"});
      }
    }

    render() {
      const sex_buttons = ['Not Specified', 'Male', 'Female']
      const activity_buttons = ['Sedentary', 'Moderate', 'Athlete']
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
              />

              <Input
                label = 'Weight'
                labelStyle={styles.profile_text_input_label}
                containerStyle={styles.profile_text_input}
                placeholder = 'Your Weight in Kilograms'
              />

              <Input
                label = 'Age'
                labelStyle={styles.profile_text_input_label}
                containerStyle={styles.profile_text_input}
                placeholder = 'Your Age in Years'
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
                label = 'Number of pounds to lose/gain'
                labelStyle={styles.profile_text_input_label}
                containerStyle={styles.profile_text_input}
                placeholder='Pounds to lose/gain'
              />

              <Input
                label = 'Number of weeks to achieve goal'
                labelStyle={styles.profile_text_input_label}
                containerStyle={styles.profile_text_input}
                placeholder='Weeks to achieve goal'
              />

              <Text style={styles.left_align_subheader_text}>
                Calculations:
              </Text>
              <Text style={styles.text_subcontainer}>
                Eat *1700* calories per day, or *11,900* calories per week.
              </Text>
              <Text style={styles.text_subcontainer}>
                Your diet should consist of *40%* carbs, *30%* protein, and *30%* fat.
              </Text>
              <Text style={styles.text_subcontainer}>
                This means *170g* carbs, *128g* protein, and *57g* fat on a daily basis.
              </Text>

              <Button
                title="Set Fitness Goals!"
                onPress={this._setFudPrefsAsync}
                buttonStyle={styles.sign_in_button}
                titleStyle={styles.title}
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
