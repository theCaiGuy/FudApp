import React from 'react';
import {
    Button,
    StatusBar,
    View,
} from 'react-native';
import { styles } from '../Styles/styles'

export class DetailScreen extends React.Component {
    static navigationOptions = {
      title: 'Details of your Füd Plan',
    };
  
    render() {
      return (
        <View style={styles.container}>
          <Button title="Back to Home" onPress={this._goHomeAsync} />
          <StatusBar barStyle="default" />
        </View>
      );
    }

    _goHomeAsync = async () => {
      this.props.navigation.navigate('Home');
    };
  }