import React from 'react';
import {
    Button,
    StatusBar,
    View,
} from 'react-native';
import { styles } from '../Styles/styles'

export class PreferencesScreen extends React.Component {
    static navigationOptions = {
      title: 'Set Food Preferences',
    };
  
    render() {
      return (
        <View style={styles.container}>
          <Button title="Ready to go!" onPress={this._goToMainAsync} />
          <StatusBar barStyle="default" />
        </View>
      );
    }

    _goToMainAsync = () => {
        this.props.navigation.navigate('App');
      };
  }