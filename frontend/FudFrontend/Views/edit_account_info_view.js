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
import {encode as btoa} from 'base-64'

/*
This view lets users view and edit their basic account information such as name,
email, etc. It also includes a button that lets them change their password.
*/

export class EditAccountInfoScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        user_id: null, // user id for authentication purposes
        name: null, // user's name
        email: null, // user's email address
        error: false, // Flag to see if error was encountered
      };
    }

    static navigationOptions = {
      title: 'View & Edit Account Info',
    };

    /*
    On startup, fetching and displaying current account info:
    user's name + email address
    */
    componentDidMount() {
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
            });
            console.log(`Recieved response ${JSON.stringify(responseJson)}`);
          });

        })
        fetch(`http://${API_PATH}/api/users/get_email`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${token}:`)}`
          },
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
              email: responseJson2['email'],
            });
            console.log(`Recieved response ${JSON.stringify(responseJson2)}`);
          });

        })
      }).catch((error) => {
        // console.error(error);
      });
    }

    render() {

      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <View style={styles.container}>
                <Text style={styles.central_header_text}>Your Account Information</Text>

                <Input
                  label = {"Name"}
                  labelStyle={styles.profile_text_input_label}
                  containerStyle={styles.profile_text_input}
                  placeholder = 'Your Name'
                  onChangeText = {(text) => this.setState({name: text})}
                  defaultValue={(this.state.name) ? String(this.state.name) : ""}
                />

                <Input
                  label = {"Email"}
                  labelStyle={styles.profile_text_input_label}
                  containerStyle={styles.profile_text_input}
                  placeholder = 'Your Email Address'
                  onChangeText = {(text) => this.setState({email: text})}
                  defaultValue={(this.state.email) ? String(this.state.email) : ""}
                />

                <View>
                  {
                    (this.state.error) ? (
                      <Text
                        style={styles.satisfy_requirements_text}
                      >
                        Error: Unable to update user account info. Please check your inputs and try again.
                      </Text>
                    ) : (
                      <View />
                    )
                  }
                </View>

                <Button
                  title="Submit Changes"
                  onPress={this._submitChangesAsync}
                  buttonStyle={styles.nav_button}
                  titleStyle={styles.nav_text}
                />

                <Button
                  title="Change Password"
                  onPress={this._changePasswordAsync}
                  buttonStyle={styles.nav_button}
                  titleStyle={styles.nav_text}
                />

            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      );
    }

    /*
    Lets users persist changes they make to their name and email address.
    Changes persist to the backend and are displayed once the page is reloaded.
    */
    _submitChangesAsync = async () => {
      let name = this.state.name;
      let email = this.state.email;
      return AsyncStorage.getItem('userToken').then((token) => {
        Promise.all([
          fetch(`http://${API_PATH}/api/users/change_name`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(`${token}:`)}`
            },
            body: JSON.stringify({"name": name})
          }),
          fetch(`http://${API_PATH}/api/users/change_email`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(`${token}:`)}`
            },
            body: JSON.stringify({"email": email})
          })
        ]).then(([response, response2]) => {
          if (response.status === 401 || response2.status === 401) {
            AsyncStorage.removeItem('userToken').then(() => {
              this.props.navigation.navigate('Auth');
              return;
            });
          }
          if (response.status === 400 || response2.status === 400) {
            this.setState({
              error: true,
            })
            return;
          }
          console.log(`New name ${name}`);
          console.log(`New email ${email}`);
          this.props.navigation.navigate('Profile');
        });
      }).catch((error) => {
        // console.error(error);
      });
    };

    _changePasswordAsync = () => {
      this.props.navigation.navigate('ChangePass');
    };
  }
