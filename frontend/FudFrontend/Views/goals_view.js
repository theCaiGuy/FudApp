import React from 'react';
import {
    Button,
    View,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    Picker,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import { styles } from '../Styles/styles'
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import { TouchableHighlight } from 'react-native-gesture-handler';

function Separator() {
  return <View style={styles.separator} />;
}

export class GoalsScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        fitness_goal: "Fat Loss",
        activity_level: "Sedentary",
        gender: "Not Specified",
      };
    }

    static navigationOptions = {
      title: 'Set Fitness Goals',
    };

    _gender_menu = null;
 
    setGenderMenuRef = ref => {
      this._gender_menu = ref;
    };
  
    showGenderMenu = () => {
      this._gender_menu.show();
    };

    _activity_menu = null;
 
    setActivityMenuRef = ref => {
      this._activity_menu = ref;
    };
  
    showActivityMenu = () => {
      this._activity_menu.show();
    };

    _goal_menu = null;
 
    setGoalMenuRef = ref => {
      this._goal_menu = ref;
    };
  
    showGoalMenu = () => {
      this._goal_menu.show();
    };

    render() {

      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <View style={styles.container}>
              <Text style={styles.central_subheader_text}>
                About you:
              </Text>

              <TextInput
                style={styles.profile_text_input}
                placeholder = 'Height (in)'
              />

              <TextInput
                style={styles.profile_text_input}
                placeholder = 'Weight (lbs)'
              />

              <TextInput
                style={styles.profile_text_input}
                placeholder = 'Age (years)'
              />

              <Text style={styles.central_subheader_text}>
                Gender:
              </Text>

              <Menu
                ref={this.setGenderMenuRef}
                button={
                  <TouchableHighlight 
                    style={styles.goal_selection_button} 
                    onPress={this.showGenderMenu}
                  >
                    <Text style={styles.goal_selection_text}>
                      {this.state.gender}
                    </Text>
                  </TouchableHighlight>
                }
                style={styles.menu_style}
              >
                <MenuItem onPress={() => {
                  this.setState({gender: "Not Specified"});
                  this._gender_menu.hide();
                }}>Not Specified</MenuItem>

                <MenuDivider />

                <MenuItem onPress={() => {
                  this.setState({gender: "Male"});
                  this._gender_menu.hide();
                }}>Male</MenuItem>

                <MenuDivider />

                <MenuItem onPress={() => {
                  this.setState({gender: "Female"});
                  this._gender_menu.hide();
                }}>Female</MenuItem>
              </Menu>

              <Text style={styles.central_subheader_text}>
                Activity level:
              </Text>

              <Menu
                ref={this.setActivityMenuRef}
                button={
                  <TouchableHighlight 
                    style={styles.goal_selection_button} 
                    onPress={this.showActivityMenu}
                  >
                    <Text style={styles.goal_selection_text}>
                      {this.state.activity_level}
                    </Text>
                  </TouchableHighlight>
                }
              >
                <MenuItem onPress={() => {
                  this.setState({activity_level: "Sedentary"});
                  this._activity_menu.hide();
                }}>Sedentary</MenuItem>

                <MenuDivider />

                <MenuItem onPress={() => {
                  this.setState({activity_level: "Moderate"});
                  this._activity_menu.hide();
                }}>Moderate</MenuItem>

                <MenuDivider />

                <MenuItem onPress={() => {
                  this.setState({activity_level: "Athlete"});
                  this._activity_menu.hide();
                }}>Athlete</MenuItem>
              </Menu>

              <Text style={styles.central_subheader_text}>
                Fitness Goals:
              </Text>

              <Menu
                ref={this.setGoalMenuRef}
                button={
                  <TouchableHighlight 
                    style={styles.goal_selection_button} 
                    onPress={this.showGoalMenu}
                  >
                    <Text style={styles.goal_selection_text}>
                      {this.state.fitness_goal}
                    </Text>
                  </TouchableHighlight>
                }
              >
                <MenuItem 
                  onPress={() => {
                    this.setState({fitness_goal: "Fat Loss"});
                    this._goal_menu.hide();
                  }}
                >
                  Fat Loss
                </MenuItem>

                <MenuDivider />

                <MenuItem 
                  onPress={() => {
                    this.setState({fitness_goal: "Muscle Gain"});
                    this._goal_menu.hide();
                  }}
                >
                  Muscle Gain
                </MenuItem>

                <MenuDivider />

                <MenuItem 
                  onPress={() => {
                    this.setState({fitness_goal: "Maintenance"});
                    this._goal_menu.hide();
                  }}
                >
                  Maintenance
                </MenuItem>
              </Menu>

              <Text style={styles.central_subheader_text}>
                Details:
              </Text>

              <TextInput
                style={styles.profile_text_input}
                placeholder = 'Number of pounds to lose/gain'
              />
              <TextInput
                style={styles.profile_text_input}
                placeholder = 'Number of weeks to achieve goal'
              />

              <Text style={styles.central_subheader_text}>
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
                title="Set Füd Preferences"
                onPress={this._setFudPrefsAsync}
              />
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      );
    }

    _setFudPrefsAsync = () => {
        this.props.navigation.navigate('Preferences');
      };
  }
