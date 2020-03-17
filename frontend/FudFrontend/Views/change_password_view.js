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
This view lets users change their password securely.
*/

export class ChangePasswordScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        user_id: null, // user id for authentication purposes
        current_password: null, // current password
        new_password: null, // new password
        new_password_copy: null, // confirmation of new password
        error: false, // Flag for whether an error has been encountered when attempting to update the password
      };
    }

    render() {

      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <View style={styles.container}>
                <Text style={styles.central_header_text}>Change your Password!</Text>

                <Input
                  label="Current Password:"
                  containerStyle={styles.signin_text_input}
                  placeholder="Your Current Password"
                  autoCorrect={false}
                  containerStyle={styles.profile_text_input}
                  labelStyle={styles.profile_text_input_label}
                  secureTextEntry={true}
                  onChangeText = {(text) => this.setState({current_password: text})}
                />

                <Input
                  label="New Password:"
                  containerStyle={styles.signin_text_input}
                  placeholder="Your New Password"
                  autoCorrect={false}
                  containerStyle={styles.profile_text_input}
                  labelStyle={styles.profile_text_input_label}
                  secureTextEntry={true}
                  onChangeText = {(text) => this.setState({new_password: text})}
                />

                <Input
                  label="Re-Enter New Password:"
                  containerStyle={styles.signin_text_input}
                  placeholder="Re-Enter Your New Password"
                  autoCorrect={false}
                  containerStyle={styles.profile_text_input}
                  labelStyle={styles.profile_text_input_label}
                  secureTextEntry={true}
                  onChangeText = {(text) => this.setState({new_password_copy: text})}
                />

                <View>
                  {
                    (this.state.new_password !== this.state.new_password_copy) ? (
                      <Text
                        style={styles.satisfy_requirements_text}
                      >
                        Error: Passwords don't match
                      </Text>
                    ) : (
                      <View />
                    )
                  }
                </View>

                <View>
                  {
                    (this.state.error) ? (
                      <Text
                        style={styles.satisfy_requirements_text}
                      >
                        Error: Unable to update password. Please check your inputs and try again.
                      </Text>
                    ) : (
                      <View />
                    )
                  }
                </View>

                <Button
                  title="Update Password"
                  onPress={this._updatePassAsync}
                  buttonStyle={styles.nav_button}
                  titleStyle={styles.nav_text}
                  disabled={
                    !(
                      this.state.current_password 
                      && this.state.new_password 
                      && this.state.new_password_copy
                    )
                    || this.state.new_password !== this.state.new_password_copy
                  }
                />

            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      );
    }

    /*
    Securely updates the password by having the user enter their current password,
    and only if it's correct can they change their password to a new one.
    Also checks that the new password matches their second entry of the
    new password.
    */
    _updatePassAsync = async () => {
      let current_password = this.state.current_password;
      let new_password = this.state.new_password;
      let new_password_copy = this.state.new_password_copy;

      if (new_password !== new_password_copy) {
        // new passwords aren't the same, display error later
        console.log("new passwords don't match: " + new_password + " vs. " + new_password_copy);
        return;
      }
      return AsyncStorage.getItem('userToken').then((token) => {
        fetch(`http://${API_PATH}/api/users/change_password`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${token}:`)}`
          },
          body: JSON.stringify({
            "old_password": current_password,
            "new_password": new_password,
          })
        })
        .then((response) => {
          if (response.status === 401) {
            AsyncStorage.removeItem('userToken').then(() => {
              this.props.navigation.navigate('Auth');
              return;
            });
          }
          if (response.status === 400 || response.status === 500) {
            this.setState({
              error: true,
            });
            return;
          }
          if (response.status !== 204) {
            {/*
              TODO: Handle 204 response better
            */}
            return;
          }
          console.log("Successful password change from " + current_password + " to " + new_password);
          this.props.navigation.navigate('Profile');
        })
      }).catch((error) => {
        // console.error(error);
      });
    };
  }
