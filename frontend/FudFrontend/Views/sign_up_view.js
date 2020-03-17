import React from 'react';
import {
  AsyncStorage,
  Image,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { styles } from '../Styles/styles'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import {
  Button,
  Input,
} from 'react-native-elements'
import { API_PATH } from '../assets/constants'


/*
This view contains fields for the user to enter account information to 
create a new account. Requires Name, Username, Password x2
Hits api/users/register endpoint to register a new user, moves
user onto setting goals and preferences

TODO: 
Require certain chars for password
Make sure all fields are filled before allowing user to submit info to backend
*/


export class SignUpScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      name: null, // User's name
      email: null, // User's email
      username: null, // User's username
      password: null, // User's password
      passwordCpy: null, // Have user reenter password
      error: false, // Boolean for whether an error has been encountered
    };
  }

  render() {
    return (
      <SafeAreaView style={styles.sign_in_container}>
        <KeyboardAwareScrollView style={{flex:1}}>

          <Image
            style={styles.logo}
            source={require('../assets/icon.png')}
          />

          <Input
            label="What is your name?"
            containerStyle={styles.signin_text_input}
            placeholder="Your Name"
            autoCorrect={false}
            containerStyle={styles.profile_text_input}
            labelStyle={styles.profile_text_input_label}
            onChangeText = {(text) => this.setState({name: text})}
          />

          <Input
            label="What is your email?"
            containerStyle={styles.signin_text_input}
            placeholder="Your Email"
            autoCorrect={false}
            autoCapitalize='none'
            containerStyle={styles.profile_text_input}
            labelStyle={styles.profile_text_input_label}
            onChangeText = {(text) => this.setState({email: text})}
          />

          <Input
            label="What is your username?"
            containerStyle={styles.signin_text_input}
            placeholder="Your Username"
            autoCorrect={false}
            autoCapitalize='none'
            containerStyle={styles.profile_text_input}
            labelStyle={styles.profile_text_input_label}
            onChangeText = {(text) => this.setState({username: text})}
          />

          <Input
            label="Password"
            containerStyle={styles.signin_text_input}
            placeholder="Your Password"
            autoCorrect={false}
            containerStyle={styles.profile_text_input}
            labelStyle={styles.profile_text_input_label}
            secureTextEntry={true}
            onChangeText = {(text) => this.setState({password: text})}
          />

          <Input
            label="Re-enter password"
            containerStyle={styles.signin_text_input}
            placeholder="Your Password Again"
            autoCorrect={false}
            containerStyle={styles.profile_text_input}
            labelStyle={styles.profile_text_input_label}
            secureTextEntry={true}
            onChangeText = {(text) => this.setState({passwordCpy: text})}
          />

          <View>
            {
              (this.state.password !== this.state.passwordCpy) ? (
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
                  Error: Unable to create a new account. Please check your inputs and try again.
                </Text>
              ) : (
                <View />
              )
            }
          </View>

          <Button
            title="Create Account"
            onPress={this._signInAsync}
            buttonStyle={styles.sign_in_button}
            titleStyle={styles.title}
            disabled={
              !(
                this.state.name 
                && this.state.email 
                && this.state.username 
                && this.state.password 
                && this.state.passwordCpy
              )
            }
          />

        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }

  /*
  Attempt to register a new user with the selected username, password, name, and email
  Display an error if the passwords don't match
  Display a separate error if unable to register the new user

  TODO (extension): More detailed error messages (ie "email invalid")
  */ 
  _signInAsync = async () => {
    let username = this.state.username;
    let password = this.state.password;
    if (password !== this.state.passwordCpy) {
      this.setState({
        error: true,
      });
      return;
    }
    let name = this.state.name;
    let email = this.state.email;
    console.log(`Attempting signup with user ${username}`);

    await AsyncStorage.removeItem('userToken');
    return (
      fetch(`http://${API_PATH}/api/users/register`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "username": username,
          "password": password,
          "email": email,
          "name": name
        })
      })
      .then((response) => {
        if (response.status === 401) {
          this.setState({
            error: true,
          })
          return;
        }
        if (response.status !== 201) {
          this.setState({
            error: true,
          })
          return;
        }
        response.json().then((responseJson) => {
          console.log(JSON.stringify(responseJson));
          AsyncStorage.setItem('userToken', responseJson['token']);
          this.props.navigation.navigate('Prefs');
        });
      })
      .catch((error) => {
        // console.error(error);
        this.setState({
          error: true,
        })
        return;
      })
    );
  };
}
