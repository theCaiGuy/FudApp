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
      name: null,
      toggle: false,
      loading: false,
    };
  }

  /*
  On startup, fetching and displaying current account info:
  user's name + email address
  */
  componentDidMount() {
    this.setState({
      loading: true,
    })

    return AsyncStorage.getItem('userToken').then((token) => {
      fetch(`http://${API_PATH}/api/users/get_name`, {
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
            name: responseJson['name'],
            loading: false,
          });
          console.log(`Recieved response ${JSON.stringify(responseJson)}`);
        });

      });
    });
  }

    render() {

      if (this.state.loading) {
        return(
          <SafeAreaView style={styles.container}>
            <Text style={styles.central_subheader_text}>Loading User Profile...</Text>
            <Button
              title="Back"
              onPress={() => {this.props.navgation.goBack()}}
              buttonStyle={styles.nav_button}
              titleStyle={styles.nav_text}
            />
          </SafeAreaView>
        )
      }

      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <View style={styles.container}>
                <Text style={styles.central_header_text}>
                  {`Welcome ${this.state.name}`}
                </Text>

                <Text style={styles.central_subheader_text}>
                  View and adjust your user profile
                </Text>

                <Button
                  title="Account Info"
                  onPress={this._editAccountInfoAsync}
                  buttonStyle={styles.nav_button}
                  titleStyle={styles.nav_text}
                />

                <Button
                  title="Goals and Preferences"
                  onPress={this._editGoalsAsync}
                  buttonStyle={styles.nav_button}
                  titleStyle={styles.nav_text}
                />

                
                {/* 
                TODO: Add color scheme changer

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
                /> */}

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
