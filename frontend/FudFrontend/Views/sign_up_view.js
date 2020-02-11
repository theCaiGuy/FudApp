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

export class SignUpScreen extends React.Component {
  static navigationOptions = {
    title: 'Sign into Füd',
  };

  render() {
    return (
      <SafeAreaView style={styles.sign_in_container}>
        <KeyboardAvoidingView style={{flex:1}}>
          <ScrollView>
            <Text style={styles.welcome}>
              What is your name?
            </Text>
            <TextInput
              style={styles.profile_text_input}
              placeholder="Name"
              autoCorrect={false}
            />
            <Text style={styles.welcome}>
              What is your email?
            </Text>
            <TextInput
              style={styles.profile_text_input}
              placeholder="Email"
              autoCorrect={false}
            />
            <Text style={styles.welcome}>
              Choose a password
            </Text>
            <TextInput
              style={styles.profile_text_input}
              placeholder="Password"
              autoCorrect={false}
              secureTextEntry={true}
            />
            <TextInput
              style={styles.profile_text_input}
              placeholder="Re-enter Password"
              autoCorrect={false}
              secureTextEntry={true}
            />
            <TouchableHighlight
              style={styles.sign_in_button}
              onPress={this._signInAsync}
            >
              <View>
                <Text style={styles.title}>Next</Text>
              </View>
            </TouchableHighlight>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  _signInAsync = async () => {
    await AsyncStorage.setItem('userToken', 'abc');
    this.props.navigation.navigate('Prefs');
  };
}
