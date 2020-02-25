import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Image,
  SafeAreaView,
  StatusBar,
  View,
} from 'react-native';
import { styles } from '../Styles/styles'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import {
  Button,
  Input,
} from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import { API_PATH } from '../assets/constants'
import {encode as btoa} from 'base-64'


/*
The opening view for the app if the user hasn't already logged in before
Provides routes for user to sign in w/ existing credentials, or sign up
for a new Füd account

TODO:
Notify user if account information is incorrect
Forgot Password
*/


export class SignInScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      username: null,
      password: null
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
            containerStyle={styles.signin_text_input}
            placeholder="Your Username"
            autoCorrect={false}
            autoCapitalize='none'
            containerStyle={styles.profile_text_input}
            labelStyle={styles.profile_text_input_label}
            leftIcon={
              <Icon
                name='user'
                size={18}
                color='black'
                style={{marginHorizontal: 10}}
              />
            }
            onChangeText = {(text) => this.setState({username: text})}
          />

          <Input
            containerStyle={styles.signin_text_input}
            placeholder="Your Password"
            autoCorrect={false}
            secureTextEntry={true}
            labelStyle={styles.profile_text_input_label}
            leftIcon={
              <Icon
                name='key'
                size={18}
                color='black'
                style={{marginHorizontal: 10}}
              />
            }
            onChangeText = {(text) => this.setState({password: text})}
          />

          <Button
            title="Sign In"
            onPress={this._signInAsync}
            buttonStyle={styles.sign_in_button}
            titleStyle={styles.title}
          />

          <Button
            title="I'm New Here"
            onPress={this._signUpAsync}
            buttonStyle={styles.sign_in_button}
            titleStyle={styles.title}
          />

          <Button
            title="Forgot Password?"
            type='clear'
          />
          
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }

  _signInAsync = async () => {
    let username = this.state.username
    let password = this.state.password
    console.log("Attempting signin with user " + username + " and password " + password);

    await AsyncStorage.removeItem('userToken');
    try {
      const res = await fetch(`http://${API_PATH}/api/users/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${username}:${password}`)}`
        },
      });
      if (res.status === 401) {
        // someone should display login failed here
        return;
      };
      const content = await res.json();
      console.log(JSON.stringify(content));
      await AsyncStorage.setItem('userToken', content.token)
      this.props.navigation.navigate('App');
    } catch (err) {
      console.error(err);
    }
  };

  _signUpAsync = async () => {
    this.props.navigation.navigate('SignUp');
  };
}

export class AuthLoadingScreen extends React.Component {
  constructor() {
    super();
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken');

    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
    this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}
