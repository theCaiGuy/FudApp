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
import FlipToggle from 'react-native-flip-toggle-button'
import { API_PATH } from '../assets/constants'
import {encode as btoa} from 'base-64'

/*
This view serves as a place for users to view and edit any of the information
they have given us, including their account info (username, password, etc.),
fitness goals, current physical state, dietary restrictions + preferences, etc.
This will also be the page from which users can sign out of the app.

TODO:
(1) Determine a clear flow with the rest of the app.
(2) Figure out all the routing.
*/

export class UserProfileScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        user_id: null,
        toggle: false,
      };
    }

    render() {

      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <View style={styles.container}>
                <Text style={styles.central_header_text}>User Profile Page</Text>

                <Button
                  title="Account Info"
                  onPress={this._editAccountInfoAsync}
                  buttonStyle={styles.nav_button}
                  titleStyle={styles.central_subheader_text}
                />

                <Button
                  title="Goals and Preferences"
                  onPress={this._editGoalsAsync}
                  buttonStyle={styles.nav_button}
                  titleStyle={styles.central_subheader_text}
                />

                <Text style={styles.left_align_subheader_text}>Color Scheme</Text>
                <FlipToggle
                  value={this.state.toggle}
                  buttonWidth={200}
                  buttonHeight={50}
                  buttonRadius={50}

                  onLabel={'Dark Mode'}
                  offLabel={'Light Mode'}
                  buttonOnColor={'#3b821b'}
                  buttonOffColor={'#3b821b'}
                  sliderOnColor={'#ffffff'}
                  sliderOffColor={'#ffffff'}
                  labelStyle={{ color: '#ffffff' }}
                  onToggle={(newState) => {
                    console.log(`toggle is ${this.state.toggle ? `off, light mode` : `on, dark mode`}`);
                    this.setState({toggle: this.state.toggle ? false : true});
                  }}
                  onToggleLongPress={() => {
                    console.log('toggle long pressed!');
                  }}
                />

            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      );
    }

    _editAccountInfoAsync = () => {
      this.props.navigation.navigate('EditAccountInfo');
    };

    _editGoalsAsync = () => {
      this.props.navigation.navigate('EditGoals');
    };

  }
