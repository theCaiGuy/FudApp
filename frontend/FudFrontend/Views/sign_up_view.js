import React from 'react';
import {
  AsyncStorage,
  Image,
  SafeAreaView,
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
If account already exists then tell the user
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
      name: null,
      email: null,
      username: null,
      password: null,
      passwordCpy: null
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
            label="Choose a password"
            containerStyle={styles.signin_text_input}
            placeholder="Your Password"
            autoCorrect={false}
            containerStyle={styles.profile_text_input}
            labelStyle={styles.profile_text_input_label}
            secureTextEntry={true}
            onChangeText = {(text) => this.setState({password: text})}
          />

          <Input
            label="Re-enter your password"
            containerStyle={styles.signin_text_input}
            placeholder="Your Password Again"
            autoCorrect={false}
            containerStyle={styles.profile_text_input}
            labelStyle={styles.profile_text_input_label}
            secureTextEntry={true}
            onChangeText = {(text) => this.setState({passwordCpy: text})}
          />

          <Button
            title="Create Account"
            onPress={this._signInAsync}
            buttonStyle={styles.sign_in_button}
            titleStyle={styles.title}
          />

        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }

  _signInAsync = async () => {
    let username = this.state.username
    let password = this.state.password
    if (password !== this.state.passwordCpy) {
      // passwords aren't the same, display error later
      return
    }
    let name = this.state.name
    let email = this.state.email
    console.log("Attempting signup with user " + username + " and password " + password);

    await AsyncStorage.removeItem('userToken');
    try {
      const res = await fetch(`http://${API_PATH}/api/users/register`, {
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
      });
      const content = await res.json();
      console.log(JSON.stringify(content));
      console.log(content.token)
      console.log("TEST")
      // const token = await content.token

      await AsyncStorage.setItem('userToken', content.token);
      this.props.navigation.navigate('Prefs');
    } catch (err) {
      return;
    }
  };
}
