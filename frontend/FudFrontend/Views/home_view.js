import React from 'react';
import {
  AsyncStorage,
  Button,
  View,
} from 'react-native';
import { styles } from '../Styles/styles'

export class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Welcome to the app!',
  };

  render() {
    return (
      <View style={styles.container}>
        <Button title="Show More Details" onPress={this._showMoreApp} />
        <Button title="Change Food Preferences" onPress={this._changePrefs} />
        <Button title="Sign Out of Füd" onPress={this._signOutAsync} />
      </View>
    );
  }

  _showMoreApp = () => {
    this.props.navigation.navigate('Detail');
  };

  _changePrefs = () => {
    this.props.navigation.navigate('Prefs');
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  };
}
  