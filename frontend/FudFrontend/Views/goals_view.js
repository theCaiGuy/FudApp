import React from 'react';
import {
    Button,
    StatusBar,
    View,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    Picker,
    KeyboardAvoidingView
} from 'react-native';
import Constants from 'expo-constants';
import {Slider} from 'react-native'
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import { styles } from '../Styles/styles'

function Separator() {
  return <View style={styles_local.separator} />;
}

export class GoalsScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        fitness_goal: 0,
        activity_level: "Sedentary"
      };
    }

    static navigationOptions = {
      title: 'Set Fitness Goals',
    };

    render() {
      const { checked } = this.state;

      let radio_props_fitness_goals = [
        {label: 'Fat loss', value: 0 },
        {label: 'Muscle gain', value: 1 },
        {label: 'Maintenance', value: 2 }
      ];

      return (
        <SafeAreaView style={styles_local.container}>
          <ScrollView>
            <View style={styles_local.container}>
              <Text style={styles_local.title}>
                About you:
              </Text>

              <TextInput
                style={{ height: 40, borderWidth: 1 }}
                placeholder = 'Height (in)'
              />

              <TextInput
                style={{ height: 40, borderWidth: 1 }}
                placeholder = 'Weight (lbs)'
              />

              <Text style={styles_local.title}>
                Activity level:
              </Text>

              <Picker
                selectedValue={this.state.activity_level}
                onValueChange={(itemValue, itemIndex) =>
                  this.setState({activity_level: itemValue})
                }>
                <Picker.Item label="Sedentary" value="Sedentary" />
                <Picker.Item label="Moderate" value="Moderate" />
                <Picker.Item label="Athlete" value="Athlete" />
              </Picker>
              <Text style={styles_local.title}>
                You selected: {this.state.activity_level}
              </Text>
            </View>

            <Separator />

            <View style={styles_local.container}>
              <Text style={styles_local.title}>
                Set your fitness goals:
              </Text>

              <RadioForm
                radio_props={radio_props_fitness_goals}
                initial={0}
                onPress={(value) => {this.setState({fitness_goal:value})}}
                style={styles_local.title}
              />

              <Text style={styles_local.title}>
                You selected: {radio_props_fitness_goals[this.state.fitness_goal].label}
              </Text>

              <Text style={styles_local.title}>
                Details:
              </Text>

              <Slider
                style={{width: 200, height: 40}}
                minimumValue={0}
                maximumValue={10}
                minimumTrackTintColor="#3B821B"
                maximumTrackTintColor="#000000"
              />

              <TextInput
                style={{ height: 40, borderWidth: 1 }}
                placeholder = 'Number of pounds to lose/gain'
              />
              <TextInput
                style={{ height: 40, borderWidth: 1 }}
                placeholder = 'Number of weeks to achieve goal'
              />
            </View>

            <Separator />

            <View style={styles.container}>
              <Text style={styles_local.title}>
                Calculations:
              </Text>
              <Text>
                Eat *1700* calories per day, or *11,900* calories per week.
              </Text>
              <Text>
                Your diet should consist of *40%* carbs, *30%* protein, and *30%* fat.
              </Text>
              <Text>
                This means *170g* carbs, *128g* protein, and *57g* fat on a daily basis.
              </Text>
            </View>

            <View style={styles.container}>
              <Button
                title="Set Füd Preferences"
                onPress={this._setFudPrefsAsync}
              />
              <StatusBar barStyle="default" />
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    _setFudPrefsAsync = () => {
        this.props.navigation.navigate('Preferences');
      };
  }

  const styles_local = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: Constants.statusBarHeight,
      marginHorizontal: 16,
    },
    title: {
      textAlign: 'center',
      marginVertical: 8,
    },
    fixToText: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    separator: {
      marginVertical: 8,
      borderBottomColor: '#737373',
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
});
