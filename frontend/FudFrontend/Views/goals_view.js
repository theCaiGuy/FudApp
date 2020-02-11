import React from 'react';
import {
    Button,
    StatusBar,
    View,
    StyleSheet,
    SafeAreaView,
    Text,
} from 'react-native';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import { styles } from '../Styles/styles'

function Separator() {
  return <View style={styles_local.separator} />;
}

export class GoalsScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {fitness_goal: 0};
    }

    static navigationOptions = {
      title: 'Set Fitness Goals',
    };

    render() {
      const { checked } = this.state;

      let radio_props_fitness_goals = [
        {label: 'Fat loss', value: 0 },
        {label: 'Muscle gain', value: 1 }
      ];

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.container}>
            <Text>
              Set your fitness goals:
            </Text>

            <RadioForm
              radio_props={radio_props_fitness_goals}
              initial={0}
              onPress={(value) => {this.setState({fitness_goal:value})}}
            />

            <Text>
              You selected: {radio_props_fitness_goals[this.state.fitness_goal].label}
            </Text>

          </View>

          <Separator />

          <View style={styles.container}>
            <Button
              title="Set Füd Preferences"
              onPress={this._setFudPrefsAsync}
            />
            <StatusBar barStyle="default" />
          </View>
        </SafeAreaView>
      );
    }

    _setFudPrefsAsync = () => {
        this.props.navigation.navigate('Preferences');
      };
  }

  const styles_local = StyleSheet.create({
  separator: {
    marginVertical: 8,
    borderBottomColor: '#000000',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
