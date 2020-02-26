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
        user_id: null,
        current_password: null,
        new_password: null,
        new_password_copy: null,
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

                <Button
                  title="Update Password"
                  onPress={this._updatePassAsync}
                  buttonStyle={styles.nav_button}
                  titleStyle={styles.central_subheader_text}
                />

            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      );
    }

    _updatePassAsync = async () => {
      let current_password = this.state.current_password;
      let new_password = this.state.new_password;
      let new_password_copy = this.state.new_password_copy;

      //TODO: CHECK IF CURRENT PASSWORD IS CORRECT BEFORE CREATING NEW PASSOWRD

      if (new_password !== new_password_copy) {
        // new passwords aren't the same, display error later
        console.log("new passwords don't match: " + new_password + " vs. " + new_password_copy)
        return
      }

      return
    };

  }
