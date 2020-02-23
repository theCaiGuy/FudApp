import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Button,
  CheckBox,
  Input,
} from 'react-native-elements'
import { styles } from '../Styles/styles'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import { API_PATH } from '../assets/constants'


const PROTEIN_DATA = [
  {
    id: '1',
    title: 'Chicken',
  },
  {
    id: '2',
    title: 'Turkey',
  },
  {
    id: '3',
    title: 'Steak',
  },
  {
    id: '4',
    title: 'Egg Whites',
  },
  {
    id: '5',
    title: 'Salmon',
  },
  {
    id: '6',
    title: 'Tofu',
  },
];
const CARB_DATA = [
  {
    id: '1',
    title: 'Brown Rice',
  },
  {
    id: '2',
    title: 'Pasta',
  },
  {
    id: '3',
    title: 'Bread',
  },
  {
    id: '4',
    title: 'White Rice',
  },
  {
    id: '5',
    title: 'Candy',
  },
  {
    id: '6',
    title: 'Sweet Potato',
  },
];
const FAT_DATA = [
  {
    id: '1',
    title: 'Peanut Butter',
  },
  {
    id: '2',
    title: 'Olive Oil',
  },
  {
    id: '3',
    title: 'Avacado',
  },
  {
    id: '4',
    title: 'Butter',
  },
  {
    id: '5',
    title: 'Cheese',
  },
  {
    id: '6',
    title: 'Dark Chocolate',
  },
];

function Item({ title, clicked }) {
  return (
    <View style={clicked===0?local_styles.item1:local_styles.item2}>
      <Text style={local_styles.title}>{title}</Text>
    </View>
  );
}

export class PreferencesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      protein_prefs: [],
      fat_prefs: [],
      carb_prefs: [],
      dietary_restrictions: [],
      allergens: '',
    };
  }

  updateDietaryRestrictions (restriction) {
    let restrictions = [...this.state.dietary_restrictions];
    if (restrictions.includes(restriction)) {
      restrictions.splice( restrictions.indexOf(restriction), 1 )
      this.setState({
        dietary_restrictions: restrictions
      });
    } else {
      restrictions.push(restriction)
      this.setState({
        dietary_restrictions: restrictions
      })
    }
  }

  updateProteinPrefs (protein) {
    let protein_prefs = [...this.state.protein_prefs];
    if (protein_prefs.includes(protein)) {
      protein_prefs.splice( protein_prefs.indexOf(protein), 1 )
      this.setState({
        protein_prefs: protein_prefs
      });
    } else {
      protein_prefs.push(protein)
      this.setState({
        protein_prefs: protein_prefs
      })
    }
  }

  updateFatPrefs (fat) {
    let fat_prefs = [...this.state.fat_prefs];
    if (fat_prefs.includes(fat)) {
      fat_prefs.splice( fat_prefs.indexOf(fat), 1 )
      this.setState({
        fat_prefs: fat_prefs
      });
    } else {
      fat_prefs.push(fat)
      this.setState({
        fat_prefs: fat_prefs
      })
    }
  }

  updateCarbPrefs (carb) {
    let carb_prefs = [...this.state.carb_prefs];
    if (carb_prefs.includes(carb)) {
      carb_prefs.splice( carb_prefs.indexOf(carb), 1 )
      this.setState({
        carb_prefs: carb_prefs
      });
    } else {
      carb_prefs.push(carb)
      this.setState({
        carb_prefs: carb_prefs
      })
    }
  }

  static navigationOptions = {
    title: 'Set Food Preferences',
  };

    render() {
      const dietary_restrictions = [
        'Vegan',
        'Vegetarian',
        'Pescatarian',
        'No Red Meat',
        'No Pork',
        'No Beef',
        'Peanut Free',
      ]

      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <Text style={styles.left_align_subheader_text}>Dietary Restrictions</Text>

            <View>
              {
                dietary_restrictions.map((l, i) => (
                  <CheckBox
                    title={l}
                    checked={this.state.protein_prefs.includes(l)}
                    checkedColor='#3b821b'
                    onPress={this.updateProteinPrefs.bind(this, l)}
                    key={i}
                  />
                ))
              }
            </View>

            <Input
              label = 'Allergens'
              labelStyle={styles.profile_text_input_label}
              containerStyle={styles.profile_text_input}
              placeholder='Comma-separated list'
            />

            <Text style={styles.left_align_subheader_text}>Protein Preferences</Text>

            <View>
              {
                PROTEIN_DATA.map((l, i) => (
                  <CheckBox
                    title={l.title}
                    checked={this.state.protein_prefs.includes(i)}
                    checkedColor='#3b821b'
                    onPress={this.updateProteinPrefs.bind(this, i)}
                    key={i}
                  />
                ))
              }
            </View>

            <Text style={styles.left_align_subheader_text}>Carbohydrate Preferences</Text>

            <View>
              {
                CARB_DATA.map((l, i) => (
                  <CheckBox
                    title={l.title}
                    checked={this.state.carb_prefs.includes(i)}
                    checkedColor='#3b821b'
                    onPress={this.updateCarbPrefs.bind(this, i)}
                    key={i}
                  />
                ))
              }
            </View>

            <Text style={styles.left_align_subheader_text}>Fat Preferences</Text>

            <View>
              {
                FAT_DATA.map((l, i) => (
                  <CheckBox
                    title={l.title}
                    checked={this.state.fat_prefs.includes(i)}
                    checkedColor='#3b821b'
                    onPress={this.updateFatPrefs.bind(this, i)}
                    key={i}
                  />
                ))
              }
            </View>

            <Button
              title="Generate Meals!"
              onPress={this._generateMealsAsync}
              buttonStyle={styles.sign_in_button}
              titleStyle={styles.title}
            />          
          </KeyboardAwareScrollView>
        </SafeAreaView>
      );
    }

    _generateMealsAsync = () => {
      this.props.navigation.navigate('App');
    };
  }

const local_styles = StyleSheet.create({
  item1: {
    backgroundColor: '#419A1C',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  item2: {
    backgroundColor: '#00FF00',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 16,
  },
});
