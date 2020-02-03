import React from 'react';
import {
    Button,
    StatusBar,
    View,
} from 'react-native';
import { styles } from '../Styles/styles'

export class GoalsScreen extends React.Component {
    static navigationOptions = {
      title: 'Set Fitness Goals',
    };
  
    render() {
      return (
        <View style={styles.container}>
          <Button title="Set Füd Preferences" onPress={this._setFudPrefsAsync} />
          <StatusBar barStyle="default" />
        </View>
      );
    }

    _setFudPrefsAsync = () => {
        this.props.navigation.navigate('Preferences');
      };
  }