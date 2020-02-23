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


export class SignUpScreen extends React.Component {
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
            label="What is your name?"
            containerStyle={styles.signin_text_input}
            placeholder="Your Name"
            autoCorrect={false}
            containerStyle={styles.profile_text_input}
            labelStyle={styles.profile_text_input_label}
          />

          <Input
            label="What is your email?"
            containerStyle={styles.signin_text_input}
            placeholder="Your Email"
            autoCorrect={false}
            autoCapitalize='none'
            containerStyle={styles.profile_text_input}
            labelStyle={styles.profile_text_input_label}
          />

          <Input
            label="Choose a password"
            containerStyle={styles.signin_text_input}
            placeholder="Your Password"
            autoCorrect={false}
            containerStyle={styles.profile_text_input}
            labelStyle={styles.profile_text_input_label}
            secureTextEntry={true}
          />

          <Input
            label="Re-enter your password"
            containerStyle={styles.signin_text_input}
            placeholder="Your Password Again"
            autoCorrect={false}
            containerStyle={styles.profile_text_input}
            labelStyle={styles.profile_text_input_label}
            secureTextEntry={true}
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
    await AsyncStorage.setItem('userToken', 'abc');
    this.props.navigation.navigate('Prefs');
  };
}
