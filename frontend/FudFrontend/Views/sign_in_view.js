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

export class SignInScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  };

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
            placeholder="Your Email"
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
