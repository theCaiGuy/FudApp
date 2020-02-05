import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Button,
  StatusBar,
  View,
} from 'react-native';
import { styles } from '../Styles/styles'
import { TouchableOpacity } from 'react-native-gesture-handler';

export class SignInScreen extends React.Component {
  static navigationOptions = {
    title: 'Sign into Füd',
  };

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity title="Sign in!" onPress={this._signInAsync}>
          <View style={styles.button}>
            <Text>Test</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  _signInAsync = async () => {
    await AsyncStorage.setItem('userToken', 'abc');
    this.props.navigation.navigate('App');
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