import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Button,
  Image,
  KeyboardAvoidingView,
  SafeAreaView, 
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { styles } from '../Styles/styles'
import { TouchableHighlight } from 'react-native-gesture-handler';

export class SignInScreen extends React.Component {
  static navigationOptions = {
      header: null,
  };


  render() {
    return (
      <SafeAreaView style={styles.sign_in_container}>
        <KeyboardAvoidingView style={{flex:1}}>
          <Image
            style={styles.logo}
            source={require('../assets/icon.png')}
          />
          <TextInput
            style={styles.profile_text_input}
            placeholder="Username"
            autoCorrect={false}
            autoCapitalize={false}              
          />
          <TextInput
            style={styles.profile_text_input}
            placeholder="Password"
            autoCorrect={false}
            autoCapitalize={false}
            secureTextEntry={true}
          />
          <TouchableHighlight 
            style={styles.sign_in_button}
            onPress={this._signInAsync}
          >
            <View>
              <Text style={styles.title}>Sign In</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight 
            style={styles.sign_up_button}
            onPress={this._signUpAsync}
          >
            <View>
              <Text style={styles.title}>I'm New Here</Text>
            </View>
          </TouchableHighlight>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  _signInAsync = async () => {
    await AsyncStorage.setItem('userToken', 'abc');
    this.props.navigation.navigate('App');
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